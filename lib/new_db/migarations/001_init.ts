import { USE_FRESH_DB } from '@/dev.config';
import { Migration } from '../../types/migrations';

export const migration_001_init: Migration = {
    toVersion: 1,
    migrate: async (db) => {
        if (USE_FRESH_DB) {
            await db.execAsync(`DROP TABLE IF EXISTS notifications`);
            await db.execAsync(`DROP TABLE IF EXISTS events`);
            await db.execAsync(`DROP TABLE IF EXISTS todos`);
        }

        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS todos (
                id TEXT PRIMARY KEY,                    -- UUID
                title TEXT NOT NULL,
                description TEXT NOT NULL DEFAULT '',
                isRepeating INTEGER DEFAULT 0,
                repeatOn TEXT,                          -- JSON integer array
                isTemplate INTEGER DEFAULT 0,
                dateStart TEXT,                         -- YYYY-MM-DD
                dateEnd TEXT,                           -- YYYY-MM-DD
                timeStart TEXT NOT NULL,                -- HH:MM
                timeEnd TEXT NOT NULL,                  -- HH:MM
                createdAt TEXT NOT NULL,                -- ISO
                updatedAt TEXT NOT NULL                 -- ISO
            );

            CREATE TABLE IF NOT EXISTS events (
                id TEXT PRIMARY KEY,                    -- UUID
                title TEXT NOT NULL,
                description TEXT NOT NULL DEFAULT '',
                date TEXT NOT NULL,                     -- YYYY-MM-DD
                timeStart TEXT NOT NULL,                -- HH:MM
                timeEnd TEXT NOT NULL,                  -- HH:MM
                sourceType TEXT NOT NULL,               -- manual or generated or template
                todoId TEXT,
                isDismissed INTEGER NOT NULL DEFAULT 0,
                completedAt TEXT DEFAULT '',            -- ISO
                createdAt TEXT NOT NULL,                -- ISO
                updatedAt TEXT NOT NULL,                -- ISO
                FOREIGN KEY (todoId) REFERENCES todos (id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS notifications (
                id TEXT PRIMARY KEY,                    -- UUID
                eventId TEXT NOT NULL,
                type TEXT NOT NULL,
                minutesBefore INTEGER NOT NULL DEFAULT 0,
                isActive INTEGER DEFAULT 1,
                createdAt TEXT NOT NULL,
                FOREIGN KEY (eventId) REFERENCES events (id) ON DELETE CASCADE
            );
        `);
    },
};
