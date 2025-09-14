import { BaseEvent, GhostEvent } from "./data"

export interface UIEv extends Event, BaseEvent {
    left: string
    width: string
    isGhost: boolean
}

export interface UIGhostEvent extends GhostEvent, BaseEvent {
    left: string
    width: string
    isGhost: boolean
}

export type TimelineItem = UIEv | UIGhostEvent
