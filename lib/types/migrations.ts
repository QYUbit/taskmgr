import * as SQLite from 'expo-sqlite';

export type Migration = {
  toVersion: number;
  migrate: (db: SQLite.SQLiteDatabase) => Promise<void>;
};
