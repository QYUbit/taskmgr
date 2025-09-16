import { LOG_LEVELS } from "@/dev.config"

export type LogLevel = 'log' | 'debug' | 'info' | 'warn' | 'error' | 'trace'

export function log(message?: string, level: LogLevel = 'log', domain?: string) {
    if (LOG_LEVELS.includes(level) || LOG_LEVELS.includes('*')) {
        if (domain) {
            console[level](`${domain.toUpperCase()}: ${message}`)
        } else {
            console[level](message)
        }
    }
}

export function error<T extends Error>(err: T) {
    if (LOG_LEVELS.includes('error') || LOG_LEVELS.includes('*')) {
        console.error(err)
    }
}
