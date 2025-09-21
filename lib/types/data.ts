import { CalendarDate, DateRange, TimeRange } from "../utils/time"

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

export interface BaseEvent {
    id: string
    title: string
    description: string
    duration: TimeRange
}

export interface Event extends BaseEvent {
    date: CalendarDate
    sourceType: "manual" | "generated" | "template"
    todoId?: string
    isDismissed: boolean
    completedAt?: string
    createdAt: string
    updatedAt: string
}

export type NewEvent = Omit<Event, 'id' | 'createdAt' | 'updatedAt'>

export interface GhostEvent extends BaseEvent {
    todoId?: string // Should exist
}

export interface Notification {
    id: string;
    eventId: string;
    type: 'start' | 'end' | 'custom';
    triggerTime: string;
    isActive: boolean;
    notificationId?: string;
    createdAt: string;
}
