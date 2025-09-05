import { useState } from 'react';
import { dbService } from '../lib/db/index';

export const useMaintenanceOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cleanupOldEvents = async (daysToKeep: number = 30) => {
    try {
      setLoading(true);
      setError(null);
      await dbService.cleanupOldEvents(daysToKeep);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cleanup events';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const generateEventsForPeriod = async (startDate: string, endDate: string) => {
    try {
      setLoading(true);
      setError(null);
      await dbService.generateEventsForPeriod(startDate, endDate);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate events';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const generateEventsForNextWeeks = async (weeksAhead: number = 2) => {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + (weeksAhead * 7));

    const startDateStr = today.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    await generateEventsForPeriod(startDateStr, endDateStr);
  };

  return {
    cleanupOldEvents,
    generateEventsForPeriod,
    generateEventsForNextWeeks,
    loading,
    error
  };
};
