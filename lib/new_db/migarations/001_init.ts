import { Migration } from '../../types/migrations';

export const migration_001_init: Migration = {
    toVersion: 1,
    migrate: async (db) => {
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS todos (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT NOT NULL DEFAULT '',
            isRepeating INTEGER DEFAULT 0,
            repeatOn TEXT,
            timeConstraint TEXT,
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS events (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT NOT NULL DEFAULT '',
            dateRangeStart TEXT NOT NULL,
            dateRangeEnd TEXT NOT NULL,
            timeStart TEXT NOT NULL,
            timeEnd TEXT NOT NULL,
            sourceType TEXT NOT NULL,
            sourceTodoId TEXT,
            completedAt TEXT DEFAULT '',
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            eventId TEXT NOT NULL,
            type TEXT NOT NULL,
            minutesBefore INTEGER NOT NULL,
            isActive INTEGER DEFAULT 1,
            createdAt TEXT NOT NULL,
            FOREIGN KEY (eventId) REFERENCES events (id) ON DELETE CASCADE
            );
        `);
    },
};
