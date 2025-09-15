import { BaseEvent, GhostEvent } from "./data"

export interface UIEv extends Event, BaseEvent {
    left: string
    top: number
    width: string
    height: number
    isGhost: boolean
}

export interface UIGhostEvent extends GhostEvent, BaseEvent {
    left: string
    top: number
    width: string
    height: number
    isGhost: boolean
}

export type TimelineItem = UIEv | UIGhostEvent
