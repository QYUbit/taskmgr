import { dbService } from "../db/service";
import { GhostEvent, Todo } from "../types/data";
import { CalendarDate } from "./time";
import { todoAppliesToDate } from "./todo";

export async function generateGhostEventsForDate(date: CalendarDate): Promise<GhostEvent[]> {
    const todos = await dbService.getAllTodos();    
    const ghostEvents: GhostEvent[] = [];

    for (const todo of todos) {
        if (todoAppliesToDate(todo, date)) {
            const ghostEvent = createGhostEventFromTodo(todo);
            if (ghostEvent) {
                ghostEvents.push(ghostEvent);
            }
        }
    }

    return ghostEvents
}

export function createGhostEventFromTodo({ id, title, description, duration }: Todo): GhostEvent {
    return {
        id: `ghost_${id}`,
        title,
        description,
        duration: duration,
        todoId: id
    }
}
