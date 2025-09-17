import { LOG_LEVELS } from '@/dev.config';

export type LogLevel = 'log' | 'debug' | 'info' | 'warn' | 'error' | 'trace';

export function logger(domain?: string) {
    return {
        log(...message: string[]) { wrapper('log', domain, ...message) },
        info(...message: string[]) { wrapper('info', domain, ...message) },
        debug(...message: string[]) { wrapper('debug', domain, ...message) },
        warn(...message: string[]) { wrapper('warn', domain, ...message) },
        error(...message: string[]) { wrapper('error', domain, ...message) },
    };
}

function wrapper(level: LogLevel = 'log', domain?: string, ...message: string[]) {
    if (LOG_LEVELS.includes(level) || LOG_LEVELS.includes('*')) {
        if (domain) {
            console[level](`${domain.toUpperCase()}: ${message}`);
        } else {
            console[level](message);
        }
    }
}

export function error<T extends Error>(err: T) {
    if (LOG_LEVELS.includes('error') || LOG_LEVELS.includes('*')) {
        console.error(err);
    }
}
