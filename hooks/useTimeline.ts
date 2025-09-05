import { useCallback, useEffect, useState } from 'react';
import { Event, GhostEvent } from '../lib/db/types';
import { useEventsForDate } from './useEvents';
import { useGhostEventsForDate } from './useGhostEvents';

export type TimelineItem = Event | GhostEvent;

export const useTimeline = (dateString: string) => {
  const { events, loading: eventsLoading, error: eventsError, refetch: refetchEvents } = useEventsForDate(dateString);
  const { ghostEvents, loading: ghostLoading, error: ghostError, refetch: refetchGhosts } = useGhostEventsForDate(dateString);

  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const loading = eventsLoading || ghostLoading;
  const error = eventsError || ghostError;

  // Kombiniere Events und Ghost Events
  useEffect(() => {
    const combined: TimelineItem[] = [...events, ...ghostEvents];
    
    // Sortiere nach Startzeit
    combined.sort((a, b) => {
      const timeA = new Date(a.timeRange.startTime);
      const timeB = new Date(b.timeRange.startTime);
      
      if (timeA.getHours() > timeB.getHours()) {
        return -1
      }
      if (timeB.getHours() > timeB.getHours()) {
        return -1
      }
      if (timeA.getMinutes() > timeB.getMinutes()) {
        return 1
      }
      if (timeB.getMinutes() > timeB.getMinutes()) {
        return 1
      }
      return 0;
    });

    setTimelineItems(combined);
  }, [events, ghostEvents]);

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
};
