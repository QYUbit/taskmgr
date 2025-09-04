import { getConfigItem, setConfigItem } from "@/lib/data/config";
import { useCallback, useState } from "react";

interface Config {
    test: string;
}

type ConfigKey = keyof Config;

const defaultValues: Config = {
    test: ""
}

export function useConfig() {
    const [configCache, setConfigCache] = useState<Partial<Config>>({});

    const get = useCallback(
        async (key: ConfigKey): Promise<string> => {
            if (configCache[key] !== undefined) {
                return configCache[key];
            }
            
            try {
                const value = await getConfigItem(key);
                const resolvedValue = value ?? defaultValues[key];
                
                setConfigCache(prev => ({
                    ...prev,
                    [key]: resolvedValue
                }));
                
                return resolvedValue;
            } catch (error) {
                console.error(`Failed to get config item "${key}":`, error);
                return defaultValues[key];
            }
        },
        [configCache]
    );

    const set = useCallback(
        async (key: ConfigKey, value: string): Promise<void> => {
            try {
                await setConfigItem(key, value);
                
                setConfigCache(prev => ({
                    ...prev,
                    [key]: value
                }));
            } catch (error) {
                console.error(`Failed to set config item "${key}":`, error);
                throw error;
            }
        },
        [configCache]
    );

    return { get, set };
}
