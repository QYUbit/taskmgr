import { NewTodo, Todo } from "../types/data";

export function isTodoRepeating(todo: Todo | NewTodo): boolean {
    return todo.repeatOn.length > 0
}
