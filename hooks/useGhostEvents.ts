import { useCallback, useEffect, useState } from 'react';
import { dbService } from '../lib/db/index';
import { GhostEvent } from '../lib/db/types';

export const useGhostEventsForDate = (dateString: string) => {
  const [ghostEvents, setGhostEvents] = useState<GhostEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGhostEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const ghostEventsData = await dbService.generateGhostEventsForDate(dateString);
      setGhostEvents(ghostEventsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ghost events');
      setGhostEvents([]);
    } finally {
      setLoading(false);
    }
  }, [dateString]);

  useEffect(() => {
    loadGhostEvents();
  }, [loadGhostEvents]);

  return { 
    ghostEvents, 
    loading, 
    error, 
    refetch: loadGhostEvents 
  };
};

export const useGhostEventOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const renderGhostEvent = async (ghostEventId: string, todoId: string, date: string) => {
    try {
      setLoading(true);
      setError(null);
      const eventId = await dbService.renderGhostEvent(ghostEventId, todoId, date);
      return eventId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to render ghost event';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { 
    renderGhostEvent, 
    loading, 
    error 
  };
};
