import { DEFAULT_CONFIG } from '@/constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppConfig } from '../types/config';
import { logger } from './log';

const STORAGE_KEY = 'APP_CONFIG';

export const loadConfig = async (): Promise<AppConfig> => {
  try {
    const storedConfig = await AsyncStorage.getItem(STORAGE_KEY);
    return storedConfig ? JSON.parse(storedConfig) : DEFAULT_CONFIG;
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to load condig';
    logger('config').error(msg);
    return DEFAULT_CONFIG;
  }
};

export const saveConfig = async (config: AppConfig): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to save condig';
    logger('config').error(msg);
  }
};
