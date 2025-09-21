import { dbService } from "../db/service";
import { NewEvent, Todo } from "../types/data";
import { CalendarDate } from "./time";
import { todoAppliesToDate } from "./todos";

export async function generateEventsForDate(date: CalendarDate) {
    const todos = await dbService.getAllTodos();
    const filtered = todos.filter(t => todoAppliesToDate(t, date))

    filtered.forEach(async (t) => {
        const event = generateEventFromTodo(t, date);
        await dbService.createEvent(event);
    });
}

export function generateEventFromTodo(todo: Todo, date: CalendarDate): NewEvent {
    return {
        title: todo.title,
        description: todo.description,
        date,
        duration: todo.duration,
        sourceType: 'generated',
        todoId: todo.id,
        isDismissed: false,
    };
}

export async function cleanupOldEvents(keepDays: number) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - keepDays);
    const cutoffString = cutoffDate.toISOString().split('T')[0];

    await dbService.deleteDismissedEvents();
    await dbService.deleteEventsOlderThen(cutoffString);
}
