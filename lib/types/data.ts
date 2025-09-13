import { CalendarDate, DateRange, TimeRange } from "../data/time"

export interface Todo {
    id: string
    title: string
    description: string
    repeatOn: number[]
    isTemplate: boolean
    dateRange?: DateRange
    duration: TimeRange
    createdAt: string
    updatedAt: string
}

export type NewTodo = Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>

export interface Event {
    id: string
    title: string
    description: string
    date: CalendarDate
    duration: TimeRange
    sourceType: ""
    todoId?: string
    isDismissed: boolean
    completedAt?: string
    createdAt: string
    updatedAt: string
}

export type NewEvent = Omit<Event, 'id' | 'createdAt' | 'updatedAt'>

export interface Notification {
    id: string;
    eventId: string;
    type: 'start' | 'end' | 'custom';
    triggerTime: string;
    isActive: boolean;
    notificationId?: string;
    createdAt: string;
}
