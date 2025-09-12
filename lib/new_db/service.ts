import * as SQLite from 'expo-sqlite';
import { CalendarDate, DateRange, DayTime, TimeRange } from '../data/time';
import { DateConstraint, getTodoDateConstraint, isTodoRepeating } from '../data/todo';
import { Event, NewEvent, NewTodo, Todo } from '../types/data';
import { migrations } from './migrations';

export class DBService {
  private static instance: DBService;
  private db!: SQLite.SQLiteDatabase;
  private isInitialized = false;
  private readonly LATEST_VERSION = 2;

  private constructor() {}

  static getInstance(): DBService {
    if (!DBService.instance) {
      DBService.instance = new DBService();
    }
    return DBService.instance;
  }

  async init(): Promise<void> {
    if (this.isInitialized) return;
    this.db = await SQLite.openDatabaseAsync('calendar.db');

    await this.runMigrations();

    this.isInitialized = true;
  }

  private async runMigrations(): Promise<void> {
    const row = await this.db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    let currentVersion = row?.user_version ?? 0;

    for (const migration of migrations) {
      if (currentVersion < migration.toVersion) {
        await migration.migrate(this.db);
        await this.db.execAsync(`PRAGMA user_version = ${migration.toVersion}`);
        currentVersion = migration.toVersion;
      }
    }

    if (currentVersion !== this.LATEST_VERSION) {
      console.warn(
        `DB-Version is ${currentVersion}, but LATEST_VERSION is ${this.LATEST_VERSION}. Missing migration?`
      );
    }
  }

  // TODOs
  async createTodo(data: NewTodo): Promise<string> {
    await this.init();
    const id = this.generateId();
    const now = new Date().toISOString();

    await this.db.runAsync(
      `INSERT INTO todos (id, title, description, isRepeating, repeatOn, dateConstraint, timeStart, timeEnd, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.title,
        data.description,
        isTodoRepeating(data) ? 1 : 0,
        JSON.stringify(data.repeatOn),
        JSON.stringify(getTodoDateConstraint(data)),
        data.duration.start?.toString() ?? null,
        data.duration.end?.toString() ?? null,
        now,
        now
      ]
    );
    return id;
  }

  async getAllTodos(): Promise<Todo[]> {
    await this.init();
    const rows = await this.db.getAllAsync('SELECT * FROM todos ORDER BY createdAt DESC', []);
    
    return rows.map((row: any) => {
      const dateConstraint = (row.dateConstraint as DateConstraint)

      return {
        id: row.id,
        title: row.title,
        description: row.description,
        isRepeating: row.isRepeating === 1,
        repeatOn: JSON.parse(row.repeatOn || '[]'),
        duration: new TimeRange(DayTime.fromString(row.timeStart), DayTime.fromString(row.timeEnd)),
        dateRange: dateConstraint.type === "frame"
          ? new DateRange(
            dateConstraint.frame && dateConstraint.frame[0] ? CalendarDate.fromString(dateConstraint.frame[0]) : null,
            dateConstraint.frame && dateConstraint.frame[1] ? CalendarDate.fromString(dateConstraint.frame[1]) : null
          ) : undefined,
        singleDate: dateConstraint.type === "single"? dateConstraint.single ? CalendarDate.fromString(dateConstraint.single) : undefined : undefined,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
      }
    });
  }

  async updateTodo(id: string, updates: Partial<Todo>): Promise<void> {
    await this.init();
    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: any[] = [];
    Object.entries(updates).forEach(([k, v]) => {
      if (k === 'repeatOn' || k === 'timeConstraint') {
        fields.push(`${k} = ?`);
        values.push(JSON.stringify(v));
      } else if (typeof v === 'boolean') {
        fields.push(`${k} = ?`);
        values.push(v ? 1 : 0);
      } else if (!['id', 'createdAt', 'updatedAt'].includes(k)) {
        fields.push(`${k} = ?`);
        values.push(v);
      }
    });
    const sql = `UPDATE todos SET ${fields.join(', ')}, updatedAt = ? WHERE id = ?`;
    await this.db.runAsync(sql, [...values, now, id]);
  }

  async deleteTodo(id: string): Promise<void> {
    await this.init();
    await this.db.runAsync('DELETE FROM todos WHERE id = ?', [id]);
  }

  // Events
  async createEvent(data: NewEvent): Promise<string> {
    await this.init();
    const id = this.generateId();
    const now = new Date().toISOString();

    await this.db.runAsync(
      `INSERT INTO events (id, title, description, date, timeStart, timeEnd, sourceType, todoId, isDismissed, completedAt, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.title,
        data.description,
        data.date.toString(),
        data.duration.start?.toString() ?? null,
        data.duration.end?.toString() ?? null,
        data.sourceType,
        data.todoId || null,
        data.isDismissed,
        data.completedAt || null,
        now,
        now
      ]
    );
    return id;
  }

  async getEventsForDate(dateString: string): Promise<Event[]> {
    await this.init();
    const rows = await this.db.getAllAsync(
      `SELECT * FROM events WHERE date(?) ORDER BY timeStart`,
      [dateString]
    );
    
    return rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      date: CalendarDate.fromString(row.date),
      duration: new TimeRange(DayTime.fromString(row.timeStart), DayTime.fromString(row.timeStart)),
      sourceType: row.sourceType,
      todoId: row.sourceTodoId,
      isDismissed: row.isDismissed,
      completedAt: row.completedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }));
  }

  async updateEvent(id: string, updates: Partial<Event>): Promise<void> {
    await this.init();
    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([k, v]) => {
      if (k === 'date') {
        fields.push('date = ?');
        values.push((v as any).date.toString());
      } else if (k === 'duration') {
        fields.push('timeStart = ?', 'timeEnd = ?');
        values.push((v as any).duration.start?.toString() ?? null, (v as any).duration.end?.toString() ?? null);
      } else if (!['id', 'createdAt', 'updatedAt'].includes(k)) {
        fields.push(`${k} = ?`);
        values.push(v);
      }
    });
    const sql = `UPDATE events SET ${fields.join(', ')}, updatedAt = ? WHERE id = ?`;
    await this.db.runAsync(sql, [...values, now, id]);
  }

  async deleteEvent(id: string): Promise<void> {
    await this.init();
    await this.db.runAsync('DELETE FROM events WHERE id = ?', [id]);
  }

  async cleanupOldEvents(daysToKeep: number = 30): Promise<void> {
    await this.init();
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const cutoffString = cutoffDate.toISOString().split('T')[0];

    this.db.runAsync(
      `DELETE FROM events WHERE date(date) < date(?)`,
      [cutoffString],
    );
  }

  async markEventCompleted(id: string): Promise<void> {
    await this.updateEvent(id, { completedAt: new Date().toISOString() });
  }

  generateId() {
    return crypto.randomUUID()
  }
}

export const dbService = DBService.getInstance();