import * as SQLite from 'expo-sqlite';
import { migrations } from './migarations/migrations';
import { Event, GhostEvent, TimeRange, Todo } from './types';

export class DatabaseService {
  private static instance: DatabaseService;
  private db!: SQLite.SQLiteDatabase;
  private isInitialized = false;
  private readonly LATEST_VERSION = 3;

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
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
        `DB-Version ${currentVersion} erreicht, aber LATEST_VERSION ist ${this.LATEST_VERSION}. Migration fehlt?`
      );
    }
  }

  // TODO-Operationen
  async createTodo(data: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    await this.init();
    const id = this.generateId();
    const now = new Date().toISOString();
    await this.db.runAsync(
      `INSERT INTO todos (id, title, description, isRepeating, repeatOn, timeConstraint, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.title,
        data.description,
        data.isRepeating ? 1 : 0,
        JSON.stringify(data.repeatOn),
        JSON.stringify(data.timeConstraint),
        now,
        now
      ]
    );
    return id;
  }

  async getAllTodos(): Promise<Todo[]> {
    await this.init();
    const rows = await this.db.getAllAsync('SELECT * FROM todos ORDER BY createdAt DESC', []);
    return this.parseTodosFromRows(rows);
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

  // Events-Operationen
  async createEvent(data: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    await this.init();
    const id = this.generateId();
    const now = new Date().toISOString();
    await this.db.runAsync(
      `INSERT INTO events (id, title, description, dateRangeStart, dateRangeEnd, timeStart, timeEnd, sourceType, sourceTodoId, completedAt, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.title,
        data.description,
        data.dateRange.startDate,
        data.dateRange.endDate,
        data.timeRange.startTime,
        data.timeRange.endTime,
        data.sourceType,
        data.sourceTodoId || null,
        data.completedAt,
        now,
        now
      ]
    );
    return id;
  }

  async getEventsForDate(dateString: string): Promise<Event[]> {
    await this.init();
    const rows = await this.db.getAllAsync(
      `SELECT * FROM events WHERE date(?) BETWEEN date(dateRangeStart) AND date(dateRangeEnd) ORDER BY timeStart`,
      [dateString]
    );
    return this.parseEventsFromRows(rows);
  }

  async updateEvent(id: string, updates: Partial<Event>): Promise<void> {
    await this.init();
    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: any[] = [];
    Object.entries(updates).forEach(([k, v]) => {
      if (k === 'dateRange') {
        fields.push('dateRangeStart = ?', 'dateRangeEnd = ?');
        values.push((v as any).startDate, (v as any).endDate);
      } else if (k === 'timeRange') {
        fields.push('timeStart = ?', 'timeEnd = ?');
        values.push((v as any).startTime, (v as any).endTime);
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

  async markEventCompleted(id: string): Promise<void> {
    await this.updateEvent(id, { completedAt: new Date().toISOString() });
  }

  // Ghost Events
  async generateGhostEventsForDate(dateString: string): Promise<GhostEvent[]> {
      const todos = await this.getAllTodos();
      const targetDate = new Date(dateString);
      const weekday = targetDate.getDay();
      
      const ghostEvents: GhostEvent[] = [];
  
      for (const todo of todos) {
        if (this.todoAppliesToDate(todo, dateString, weekday)) {
          const ghostEvent = this.createGhostEventFromTodo(todo, dateString);
          if (ghostEvent) {
            ghostEvents.push(ghostEvent);
          }
        }
      }
  
      return ghostEvents.sort((a, b) => 
        a.timeRange.startTime.localeCompare(b.timeRange.startTime)
      );
  }

  async renderGhostEvent(ghostEventId: string, todoId: string, date: string): Promise<string> {
      // Finde das Todo
      const todos = await this.getAllTodos();
      const todo = todos.find(t => t.id === todoId);
      
      if (!todo) {
        throw new Error('Todo not found');
      }
  
      // Erstelle Event aus Ghost Event
      const timeRange = this.getTimeRangeFromTodo(todo, date);
      if (!timeRange) {
        throw new Error('Cannot determine time range for todo');
      }
  
      const eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'> = {
        title: todo.title,
        description: todo.description,
        dateRange: { startDate: date, endDate: date },
        timeRange,
        sourceType: 'generated_from_todo',
        sourceTodoId: todoId,
        completedAt: ''
      };
  
      return this.createEvent(eventData);
  }

  // Cleanup
  async cleanupOldEvents(daysToKeep: number = 30): Promise<void> {
    await this.init();
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const cutoffString = cutoffDate.toISOString().split('T')[0];

    this.db.runAsync(
      `DELETE FROM events WHERE date(dateRangeEnd) < date(?)`,
      [cutoffString],
    );
  }

  async generateEventsForPeriod(startDate: string, endDate: string): Promise<void> {
    const todos = await this.getAllTodos();
    const currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      const dateString = currentDate.toISOString().split('T')[0];
      const weekday = currentDate.getDay();

      // Prüfe welche Todos für diesen Tag gelten
      for (const todo of todos) {
        if (this.todoAppliesToDate(todo, dateString, weekday)) {
          // Prüfe ob Event bereits existiert
          const existingEvents = await this.getEventsForDate(dateString);
          const eventExists = existingEvents.some(e => 
            e.sourceTodoId === todo.id && 
            e.dateRange.startDate === dateString
          );

          if (!eventExists) {
            const timeRange = this.getTimeRangeFromTodo(todo, dateString);
            if (timeRange) {
              await this.createEvent({
                title: todo.title,
                description: todo.description,
                dateRange: { startDate: dateString, endDate: dateString },
                timeRange,
                sourceType: 'generated_from_todo',
                sourceTodoId: todo.id,
                completedAt: ''
              });
            }
          }
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  // Helper
  private parseTodosFromRows(rows: any[]): Todo[] {
    return rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      isRepeating: row.isRepeating === 1,
      repeatOn: JSON.parse(row.repeatOn || '[]'),
      timeConstraint: JSON.parse(row.timeConstraint),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }));
  }

  private parseEventsFromRows(rows: any[]): Event[] {
    return rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      dateRange: { startDate: row.dateRangeStart, endDate: row.dateRangeEnd },
      timeRange: { startTime: row.timeStart, endTime: row.timeEnd },
      sourceType: row.sourceType,
      sourceTodoId: row.sourceTodoId,
      completedAt: row.completedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }));
  }

  private todoAppliesToDate(todo: Todo, dateString: string, weekday: number): boolean {
    const { timeConstraint } = todo;

    // Prüfe Zeit-Constraint
    switch (timeConstraint.type) {
      case 'flexible':
        // Flexible Todos erscheinen nicht als Ghost Events in Timeline
        return false;

      case 'single_day':
        return timeConstraint.date === dateString;

      case 'date_range':
        const startDate = new Date(timeConstraint.dateRange.startDate);
        const endDate = new Date(timeConstraint.dateRange.endDate);
        const targetDate = new Date(dateString);
        
        if (!(targetDate >= startDate && targetDate <= endDate)) {
          return false;
        }
        break;

      case 'daily':
        // Fällt durch zu Wiederholungs-Check
        break;
    }

    // Prüfe Wiederholung
    if (todo.isRepeating) {
      return todo.repeatOn.includes(weekday);
    }

    // Nicht-wiederholende Todos mit daily constraint gelten für alle Tage
    return timeConstraint.type === 'daily';
  }

  private getTimeRangeFromTodo(todo: Todo, dateString: string): TimeRange | null {
    switch (todo.timeConstraint.type) {
      case 'daily':
      case 'single_day':
      case 'date_range':
        return todo.timeConstraint.duration;
      case 'flexible':
        return null;
    }
  }

  private createGhostEventFromTodo(todo: Todo, dateString: string): GhostEvent | null {
    const timeRange = this.getTimeRangeFromTodo(todo, dateString);
    if (!timeRange) return null;

    return {
      id: `ghost_${todo.id}_${dateString}`,
      todoId: todo.id,
      title: todo.title,
      description: todo.description,
      date: dateString,
      timeRange,
      isGhost: true
    };
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}

export const dbService = DatabaseService.getInstance();