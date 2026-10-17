import type { TimeStopActiveState, TimeStopState } from './types'

let state: TimeStopState = { status: 'idle' }

export const getTimeStopState = (): TimeStopState => state

export const isTimeStopActive = (): boolean => state.status === 'active'

export const getActiveSourceId = (): string | null =>
  state.status === 'active' ? state.sourceId : null

export const setTimeStopActive = (next: TimeStopActiveState): void => {
  state = next
}

export const setTimeStopIdle = (): void => {
  state = { status: 'idle' }
}
