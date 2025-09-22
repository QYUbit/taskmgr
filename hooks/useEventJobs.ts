import { useConfig } from "@/context/Config";
import { cleanupOldEvents, generateEventsForDate } from "@/lib/utils/eventJob";
import { logger } from "@/lib/utils/log";
import { CalendarDate } from "@/lib/utils/time";
import { useCallback, useState } from "react";

export const useEventJobs = () => {
  const { config, update: updateConfig } = useConfig();
  const {
    lastEventJob,
    autoCleanupOldEvents,
    keepEventsDays,
    autoGenerateEvents,
  } = config ?? {}

  const [jobLoading, setJobLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    try {
      setJobLoading(true);
      setError(null);

      const today = CalendarDate.current();

      if (lastEventJob === today.toString()) return;;
      
      if (autoCleanupOldEvents) {
        await cleanupOldEvents(keepEventsDays);
      }

      if (autoGenerateEvents) {
        await generateEventsForDate(today);
      }

      updateConfig('lastEventJob', today.toString());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to execute event jobs';
      logger("event jobs").error(message);
      setError(message);
    } finally {
      setJobLoading(false);
    }
  }, [
    lastEventJob,
    autoCleanupOldEvents,
    keepEventsDays,
    autoGenerateEvents,
  ]);

  return { 
    loading: jobLoading, 
    error, 
    execute
  };
};
