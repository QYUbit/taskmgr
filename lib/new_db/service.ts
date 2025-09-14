import * as SQLite from 'expo-sqlite';
import { CalendarDate, DateRange, TimeRange } from '../data/time';
import { isTodoRepeating } from '../data/todo';
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

  // =============================================
  // TODOS
  // =============================================

  async createTodo(data: NewTodo): Promise<string> {
    await this.init();
    const id = this.generateId();
    const now = new Date().toISOString();

    await this.db.runAsync(
      `INSERT INTO todos (id, title, description, isRepeating, repeatOn, isTemplate, dateStart, dateEnd, timeStart, timeEnd, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.title,
        data.description,
        isTodoRepeating(data) ? 1 : 0,
        JSON.stringify(data.repeatOn),
        data.isTemplate,
        data.dateRange?.start?.toString() ?? null,
        data.dateRange?.end?.toString() ?? null,
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
    return rows.map((row: any) => this.mapRowToTodo(row));
  }

  async getTodoById(id: string): Promise<Todo | null> {
    await this.init();
    const row = await this.db.getFirstAsync('SELECT * FROM todos WHERE id = ?', [id]);
    return row ? this.mapRowToTodo(row) : null;
  }

  private mapRowToTodo(row: any): Todo {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      repeatOn: JSON.parse(row.repeatOn || '[]'),
      duration: TimeRange.fromString(row.timeStart, row.timeEnd),
      dateRange: DateRange.fromString(row.dateStart, row.dateEnd),
      isTemplate: row.isTemplate,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }
  }

  async updateTodo(id: string, updates: Partial<Todo>): Promise<void> {
    await this.init();

    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      switch (key) {
        case 'isTemplate':
          fields.push('isTemplate = ?');
          values.push(value ? 1 : 0);
          break;
        case 'dateRange':
          fields.push('dateStart = ?', 'dateEnd = ?');
          const range = value as DateRange;
          values.push(
            range?.start?.toString() ?? null,
            range?.end?.toString() ?? null
          );
          break;
        case 'duration':
          fields.push('timeStart = ?', 'timeEnd = ?');
          const duration = value as TimeRange;
          values.push(
            duration?.start?.toString() ?? null,
            duration?.end?.toString() ?? null
          );
          break;
        case 'isRepeating':
          fields.push('isRepeating = ?');
          values.push(value ? 1 : 0);
          break;
        case 'repeatOn':
          fields.push('repeatOn = ?');
          values.push(JSON.stringify(value));
          break;
        default:
          if (['title', 'description'].includes(key)) {
            fields.push(`${key} = ?`);
            values.push(value);
          }
      }
    });

    if (fields.length > 0) {
      const sql = `UPDATE todos SET ${fields.join(', ')}, updatedAt = ? WHERE id = ?`;
      await this.db.runAsync(sql, [...values, now, id]);
    }
  }

  async deleteTodo(id: string): Promise<void> {
    await this.init();
    await this.db.runAsync('DELETE FROM todos WHERE id = ?', [id]);
  }

  // =============================================
  // Events
  // =============================================

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
        data.todoId ?? null,
        data.isDismissed,
        data.completedAt ?? null,
        now,
        now
      ]
    );

    return id;
  }

  async getEventsForDate(dateString: string): Promise<Event[]> {
    await this.init();

    const rows = await this.db.getAllAsync(
      `SELECT * FROM events WHERE date = ? ORDER BY timeStart`,
      [dateString]
    );
    
    return rows.map((row: any) => this.mapRowToEvent(row));
  }

  private mapRowToEvent(row: any): Event {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      date: CalendarDate.fromString(row.date),
      duration: TimeRange.fromString(row.timeStart, row.timeEnd),
      sourceType: row.sourceType,
      todoId: row.todoId,
      isDismissed: row.isDismissed,
      completedAt: row.completedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }
  }

  async updateEvent(id: string, updates: Partial<Event>): Promise<void> {
    await this.init();

    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: any[] = [];

     Object.entries(updates).forEach(([key, value]) => {
      switch (key) {
        case 'date':
          fields.push('date = ?');
          values.push((value as CalendarDate).toString());
          break;
        case 'duration':
          fields.push('timeStart = ?', 'timeEnd = ?');
          const duration = value as TimeRange;
          values.push(
            duration?.start?.toString() ?? null,
            duration?.end?.toString() ?? null
          );
          break;
        case 'isDismissed':
          fields.push('isDismissed = ?');
          values.push(value ? 1 : 0);
          break;
        default:
          if (['title', 'description', 'sourceType', 'todoId', 'completedAt'].includes(key)) {
            fields.push(`${key} = ?`);
            values.push(value);
          }
      }
    });

    if (fields.length > 0) {
      const sql = `UPDATE events SET ${fields.join(', ')}, updatedAt = ? WHERE id = ?`;
      await this.db.runAsync(sql, [...values, now, id]);
    }
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