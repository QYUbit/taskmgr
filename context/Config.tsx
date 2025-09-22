import Spinner from '@/components/ui/Spinner';
import { DEFAULT_CONFIG } from '@/constants/config';
import { USE_FRESH_CONFIG } from '@/dev.config';
import { AppConfig } from '@/lib/types/config';
import { loadConfig, saveConfig } from '@/lib/utils/config';
import { logger } from '@/lib/utils/log';
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface ConfigContextType {
  config: AppConfig;
  update: <K extends keyof AppConfig>(key: K, newValue: AppConfig[K]) => Promise<void>;
  updateMultiple: (newConfig: Partial<AppConfig>) => Promise<void>;
  setToDefault: () => Promise<void>; 
}

const ConfigContext = createContext<ConfigContextType | null>(null);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  const initialize = async () => {
    const loadedConfig = await loadConfig();
    setConfig(loadedConfig);
    setLoading(false);
  };

  useEffect(() => {
    logger('config').info('Initializing config');
    if (USE_FRESH_CONFIG) {
      setLoading(false);
    } else {
      initialize();
    }
  }, []);

  const update = async <K extends keyof AppConfig>(key: K, newValue: AppConfig[K]) => {
    const updatedConfig = { ...config, [key]: newValue };
    setConfig(updatedConfig);
    await saveConfig(updatedConfig);
  }

  const updateMultiple = async (newConfig: Partial<AppConfig>) => {
    const updatedConfig = {
      ...config,
      ...newConfig,
    };
    setConfig(updatedConfig);
    await saveConfig(updatedConfig);
  };

  const setToDefault = async () => {
    setConfig(DEFAULT_CONFIG);
    await saveConfig(DEFAULT_CONFIG);
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <ConfigContext.Provider value={{ config, update, updateMultiple, setToDefault }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within an ConfigProvider');
  }
  return context;
};
