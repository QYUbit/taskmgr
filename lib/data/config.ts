import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getConfigItem(key: string): Promise<string | null> {
    try {
        return await AsyncStorage.getItem(key);
    } catch (err: any) {
        throw new Error(`An error occured while fetching config: ${err.message}`);
    }
}

export async function setConfigItem(key: string, value: string): Promise<void> {
    try {
        AsyncStorage.setItem(key, value);
    } catch (err: any) {
        throw new Error(`An error occured while setting config: ${err.message}`);
    }
}
