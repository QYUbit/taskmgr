import { cleanupOldEvents, generateEventsForDate } from "@/lib/utils/eventJob";
import { logger } from "@/lib/utils/log";
import { CalendarDate } from "@/lib/utils/time";
import { useCallback, useMemo, useState } from "react";
import { useSettings } from "./useSettings";

export const useEventJobs = () => {
  const { settings, updateSetting, loading: settingsLoading } = useSettings();
  const {
    lastEventJob,
    autoCleanupOldEvents,
    keepEventsDays,
    autoGenerateEvents,
  } = settings ?? {}

  const [jobLoading, setJobLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loading = useMemo(
    () => settingsLoading || jobLoading,
    [settingsLoading, jobLoading],
  )

  const execute = useCallback(async () => {
    try {
      setJobLoading(true);
      setError(null);

      const today = CalendarDate.current();

      if (!settings || settingsLoading) return;
      if (lastEventJob === today.toString()) return;
      
      if (autoCleanupOldEvents) {
        await cleanupOldEvents(keepEventsDays);
      }

      if (autoGenerateEvents) {
        await generateEventsForDate(today);
      }

      updateSetting('lastEventJob', today.toString());
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
    loading, 
    error, 
    execute
  };
};
