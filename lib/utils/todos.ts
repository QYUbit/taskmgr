import { Todo } from "../types/data"
import { CalendarDate } from "./time"

export function todoAppliesToDate(todo: Todo, date: CalendarDate): boolean {
    if (todo.isTemplate) {
        return false
    }

    const today = CalendarDate.current()
    if (date.isSmallerThen(today)) {
        return false
    }

    if (todo.dateRange && !todo.dateRange.isInRange(date)) {
        return false
    }

    return todo.repeatOn.includes(date.toDateObject().getDay())
}
