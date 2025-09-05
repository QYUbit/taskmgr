import { dbService } from '../db/index';

export class BackgroundTaskManager {
  private static instance: BackgroundTaskManager;
  
  static getInstance(): BackgroundTaskManager {
    if (!BackgroundTaskManager.instance) {
      BackgroundTaskManager.instance = new BackgroundTaskManager();
    }
    return BackgroundTaskManager.instance;
  }

  async runDailyMaintenance() {
    try {
      console.log('Running daily maintenance tasks...');
      
      // Cleanup alte Events (falls aktiviert)
      const settings = await this.getSettings();
      
      if (settings.autoCleanupOldEvents) {
        await dbService.cleanupOldEvents(settings.keepEventsDays);
        console.log(`Cleaned up events older than ${settings.keepEventsDays} days`);
      }

      // Generiere Events für die nächsten Wochen (falls aktiviert)
      if (settings.autoGenerateEvents) {
        const today = new Date();
        const futureDate = new Date(today);
        futureDate.setDate(futureDate.getDate() + (settings.autoGenerateWeeksAhead * 7));
        
        const startDateStr = today.toISOString().split('T')[0];
        const endDateStr = futureDate.toISOString().split('T')[0];
        
        await dbService.generateEventsForPeriod(startDateStr, endDateStr);
        console.log(`Generated events for next ${settings.autoGenerateWeeksAhead} weeks`);
      }
      
      console.log('Daily maintenance completed');
    } catch (error) {
      console.error('Daily maintenance failed:', error);
    }
  }

  private async getSettings() {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      const stored = await AsyncStorage.default.getItem('app_settings');
      const DEFAULT_SETTINGS = {
        autoCleanupOldEvents: true,
        keepEventsDays: 30,
        autoGenerateEvents: true,
        autoGenerateWeeksAhead: 2
      };
      
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Failed to load settings in background task:', error);
      return {
        autoCleanupOldEvents: true,
        keepEventsDays: 30,
        autoGenerateEvents: true,
        autoGenerateWeeksAhead: 2
      };
    }
  }
}

// Usage examples and utility functions
export const backgroundTaskManager = BackgroundTaskManager.getInstance();
