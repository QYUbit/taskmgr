export interface DateRange {
  startDate: string; // ISO date string "2025-09-03"
  endDate: string;   // ISO date string "2025-09-10"
}

export interface TimeRange {
  startTime: string; // Time string "14:30"
  endTime: string;   // Time string "16:00"
}

// Union Type für Zeit-Constraints
export type TimeConstraint = 
  | { type: 'flexible' } // Keine Zeitbeschränkung
  | { type: 'daily', duration: TimeRange } // Täglich zur selben Zeit
  | { type: 'single_day', date: string, duration: TimeRange } // Spezifischer Tag
  | { type: 'date_range', dateRange: DateRange, duration: TimeRange }; // Zeitraum

export interface Todo {
  id: string;
  title: string;
  description: string;
  isRepeating: boolean;
  repeatOn: number[]; // Week days 0-6
  timeConstraint: TimeConstraint;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  dateRange: DateRange;
  timeRange: TimeRange;
  sourceType: 'manual' | 'generated_from_todo';
  sourceTodoId?: string; // Für Tracking/Farben
  completedAt: string; // ISO string, empty wenn nicht completed
  createdAt: string;
  updatedAt: string;
}

export interface GhostEvent {
  id: string; // Temporary ID für UI
  todoId: string;
  title: string;
  description: string;
  date: string;
  timeRange: TimeRange;
  isGhost: true;
}

export interface Notification {
  id: string;
  eventId: string;
  type: 'start' | 'end' | 'custom';
  minutesBefore: number;
  isActive: boolean;
  createdAt: string;
}
