// 定义缩放预设选项类型
import { SCALE_PRESETS } from './constants'

export type ScalePreset = (typeof SCALE_PRESETS)[number]

// 为Toast元素添加超时ID类型
export interface ToastWithTimeout extends HTMLDivElement {
  timeoutId?: number
}
