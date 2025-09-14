import { USE_FRESH_DB, USE_SAMPLE_DB } from '@/dev.config';
import { CalendarDate } from '@/lib/data/time';
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
                repeatOn TEXT NOT NULL,                 -- JSON integer array
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

        if (USE_SAMPLE_DB) {
            const today = CalendarDate.fromDateObject(new Date()).toString()

            await db.execAsync(`
                INSERT INTO todos (id, title, description, repeatOn, isTemplate, dateStart, dateEnd, timeStart, timeEnd, createdAt, updatedAt)
                VALUES 
                    ('todo-1', 'Buy groceries', '', '[0,1,2,3,4,5,6]', 0, NULL, '2025-10-30', '10:00', '11:00', '2025-09-14T21:00:00Z', '2025-09-14T21:00:00Z'),
                    ('todo-2', 'Project planning', 'Set milestones for the new project', '[0,3,5]', 0, NULL, NULL, '09:00', '10:00', '2025-09-14T21:00:00Z', '2025-09-14T21:00:00Z'),
                    ('todo-3', 'Matrix', 'Gonna escape the matrix', '[0,1,2,3,4,5,6]', 0, NULL, NULL, '08:00', '13:30', '2025-09-14T21:00:00Z', '2025-09-14T21:00:00Z');

                INSERT INTO events (id, title, description, date, timeStart, timeEnd, sourceType, todoId, isDismissed, completedAt, createdAt, updatedAt)
                VALUES
                    ('event-1', 'Go for a run', 'Jog in the park for 30 minutes', '${today}', '07:00', '07:30', 'manual', NULL, 0, '', '2025-09-14T21:00:00Z', '2025-09-14T21:00:00Z'),
                    ('event-2', 'Project planning meeting', 'Set milestones for the new project', '${today}', '09:00', '10:00', 'generated', 'todo-2', 0, '', '2025-09-14T21:00:00Z', '2025-09-14T21:00:00Z');
            `);
        }
    },
};
