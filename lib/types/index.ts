import { CalendarDate, DateRange, TimeRange } from "../data/time";

export interface Todo {
  id: string;
  title: string;
  description?: string;
  isRepeating: boolean;
  repeatOn: number[];
  isSingleDay: boolean;
  specificDate?: CalendarDate;
  dateFrame?: DateRange;
  duration: TimeRange;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  date: CalendarDate;
  duration: TimeRange;
  isCompleted: boolean;
  todoId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  eventId: string;
  type: 'start' | 'end' | 'custom';
  triggerTime: string; // ISO string
  isActive: boolean;
  notificationId?: string; // System notification ID
  createdAt: string;
}

export interface AppSettings {
  id: number;
  key: string;
  value: string;
}