/**
 * 弹幕时停模块对外入口。
 * runtime 只需拿 initTimeStop；enter/release 等供测试与后续扩展。
 */

export type {
  PinnedDanmakuRef,
  TimeStopActiveState,
  TimeStopDeps,
  TimeStopIdleState,
  TimeStopState,
  TimeStopStatus,
} from './types'

export {
  getActiveSourceId,
  getTimeStopState,
  isTimeStopActive,
  setTimeStopActive,
  setTimeStopIdle,
} from './state'

export {
  discardTimeStop,
  enterTimeStop,
  handleTimeStopButtonClick,
  initTimeStop,
  releaseTimeStop,
} from './controller'
