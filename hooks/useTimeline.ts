import { CalendarDate } from '@/lib/data/time';
import { TimelineItem } from '@/lib/types/ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useEventsForDate } from './useEvents';
import { useGhostEventsForDate } from './useGhostEvents';

export function useTimeline(date: CalendarDate) {
  const { events, loading: eventsLoading, error: eventsError, refetch: refetchEvents } = useEventsForDate(date);
  const { ghostEvents, loading: ghostLoading, error: ghostError, refetch: refetchGhosts } = useGhostEventsForDate(date);

  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const loading = eventsLoading || ghostLoading;
  const error = eventsError || ghostError;

  const dateString = date.toString();

  const filteredGhostEvents = useMemo(() => {
    const filtered = ghostEvents.filter((ghostEvent) => {
      const hasMatchingEvent = events.some(event => event.todoId === ghostEvent.todoId);
      return !hasMatchingEvent;
    });
    return filtered;
  }, [ghostEvents, events]);

  useEffect(() => {
    if (loading) {
      return;
    }

    const combined = [...events, ...filteredGhostEvents];
    
    if (combined.length === 0) {
      setTimelineItems([]);
      return;
    }

    const sorted = combined.sort((a, b) => a.duration.start.compare(b.duration.start));

    const processed = sorted.map((item, index) => {
      const overlapping = sorted.filter((otherEvent, otherIndex) => {
        return otherIndex !== index && item.duration.areOverlapping(otherEvent.duration);
      });

      const isGhost = !("date" in item);
      
      const processedItem = {
        ...item,
        width: overlapping.length > 0 ? `${100 / (overlapping.length + 1)}%` : '95%',
        height: Math.max((item.duration.end.toMinutes() - item.duration.start.toMinutes()), 30),
        top: (item.duration.start.toMinutes() / (24 * 60)) * (24 * 60) + 7,
        left: overlapping.length > 0 ? `${Math.max((overlapping.filter(i => i.duration.start.isSmallerOrEqual(item.duration.start)).length * 100) / (overlapping.length + 1), 2.5)}%` : '2.5%',
        isGhost
      } as TimelineItem;

      return processedItem;
    });

    setTimelineItems(processed);
  }, [events, filteredGhostEvents, loading, dateString]);

  const refetch = useCallback(async () => {
    await Promise.all([refetchEvents(), refetchGhosts()]);
  }, [refetchEvents, refetchGhosts, dateString]);

  return {
    timelineItems,
    events,
    ghostEvents,
    loading,
    error,
    refetch
  };
}