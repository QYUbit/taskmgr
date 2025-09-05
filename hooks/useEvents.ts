import { useCallback, useEffect, useState } from 'react';
import { dbService } from '../lib/db/index';
import { Event } from '../lib/db/types';

export const useEventsForDate = (dateString: string) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const eventsData = await dbService.getEventsForDate(dateString);
      setEvents(eventsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [dateString]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return { 
    events, 
    loading, 
    error, 
    refetch: loadEvents 
  };
};

export const useEventOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createEvent = async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const id = await dbService.createEvent(eventData);
      return id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create event';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateEvent = async (id: string, updates: Partial<Event>) => {
    try {
      setLoading(true);
      setError(null);
      await dbService.updateEvent(id, updates);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update event';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await dbService.deleteEvent(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete event';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const markEventCompleted = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await dbService.markEventCompleted(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete event';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { 
    createEvent, 
    updateEvent, 
    deleteEvent, 
    markEventCompleted, 
    loading, 
    error 
  };
};
