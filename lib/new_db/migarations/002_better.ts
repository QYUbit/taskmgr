import { Migration } from '../../types/migrations';

export const migration_002_better: Migration = {
    toVersion: 1,
    migrate: async (db) => {
        // This are not the migrations, but rather the future schema (just temporary)
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS todos (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT NOT NULL DEFAULT '',
                isRepeating INTEGER DEFAULT 0,
                repeatOn TEXT,
                isTemplate INTEGER DEFAULT 0
                dateStart TEXT,
                dateEnd TEXT,
                timeStart TEXT NOT NULL,
                timeEnd TEXT NOT NULL,
                createdAt TEXT NOT NULL,
                updatedAt TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS events (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT NOT NULL DEFAULT '',
                date TEXT NOT NULL,
                timeStart TEXT NOT NULL,
                timeEnd TEXT NOT NULL,
                sourceType TEXT NOT NULL,
                FOREIGN KEY (todoId) REFERENCES todos (id) ON DELETE CASCADE
                isDismissed INTERGER NOT NULL DEFAULT 0
                completedAt TEXT DEFAULT '',
                createdAt TEXT NOT NULL,
                updatedAt TEXT NOT NULL
            );
                CREATE TABLE IF NOT EXISTS notifications (
                id TEXT PRIMARY KEY,
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
