const config = {
    freshConfig: true,
    freshDB: true,
    sampleDB: true,
    logLevels: ['*']
}

export const USE_FRESH_CONFIG = __DEV__? config.freshConfig: false
export const USE_FRESH_DB = __DEV__? config.freshDB: false
export const USE_SAMPLE_DB = __DEV__? config.sampleDB: false
export const LOG_LEVELS = __DEV__? config.logLevels: []
