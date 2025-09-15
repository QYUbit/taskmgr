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

  const filteredGhostEvents = useMemo(() => {
    return ghostEvents.filter((event) => {
      return !events.some(item => item.todoId === event.todoId)
    })
  }, [ghostEvents])

  useEffect(() => {
    const combined = [...events, ...filteredGhostEvents]
    const sorted = combined.sort((a, b) => a.duration.start.compare(b.duration.start))

    const processed = sorted.map((item, index) => {
      const overlapping = sorted.filter((otherEvent, otherIndex) => {
        return otherIndex !== index && item.duration.areOverlapping(otherEvent.duration)
      });

      return {
        ...item,
        width: overlapping.length > 0 ? `${100 / (overlapping.length + 1)}%` : '95%',
        height: Math.max((item.duration.end.toMinutes() - item.duration.start.toMinutes()), 30),
        top: (item.duration.start.toMinutes() / (24 * 60)) * (24 * 60) + 7,
        left: overlapping.length > 0 ? `${Math.max((overlapping.filter(i => i.duration.start.isSmallerOrEqual(item.duration.start)).length * 100) / (overlapping.length + 1), 2.5)}%` : '2.5%',
        isGhost: !("date" in item)
      };
    })

    setTimelineItems(processed)
  }, [events, filteredGhostEvents])

  const refetch = useCallback(async () => {
    await Promise.all([refetchEvents(), refetchGhosts()]);
  }, [refetchEvents, refetchGhosts]);

  return {
    timelineItems,
    events,
    ghostEvents,
    loading,
    error,
    refetch
  };
}
