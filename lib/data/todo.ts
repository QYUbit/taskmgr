import { NewTodo, Todo } from "../types/data";

export function isTodoRepeating(todo: Todo | NewTodo): boolean {
    return todo.repeatOn.length > 0
}

export interface DateConstraint {
    type: "single" | "frame"
    single: string | null
    frame: [string | null, string | null] | null
}

export function getTodoDateConstraint(todo: Todo | NewTodo): DateConstraint {
    return {
        type: todo.singleDate ? "single" : "frame",
        single: todo.singleDate?.toString() ?? null,
        frame: todo.dateRange ? [todo.dateRange.start?.toString() ?? null, todo.dateRange.end?.toString() ?? null] : null
    }
}
