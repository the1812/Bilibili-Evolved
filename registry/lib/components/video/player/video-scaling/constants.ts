import { ScalePreset } from './types'

// 缩放比例预设选项数组
export const SCALE_PRESETS = [
  '50%',
  '75%',
  '100%',
  '110%',
  '125%',
  '150%',
  '200%',
  '自定义',
] as const

// 缩放比例映射表
export const SCALE_MAPPING: Record<ScalePreset, number> = {
  '50%': 0.5,
  '75%': 0.75,
  '100%': 1.0,
  '110%': 1.1,
  '125%': 1.25,
  '150%': 1.5,
  '200%': 2.0,
  自定义: 1.0,
}

// 自定义缩放的范围设置
export const CUSTOM_SCALE_CONFIG = {
  min: 50, // 50%
  max: 300, // 300%
  step: 10, // 步长为10%
}

// Toast显示时间配置
export const TOAST_DURATION_CONFIG = {
  defaultValue: 3.0, // 默认显示3秒
  min: 0.5, // 最小0.5秒
  max: 5.0, // 最大5秒
  step: 0.5, // 步长0.5秒
}

// Toast显示类名
export const TOAST_CLASS_NAME = 'be-video-scale-toast'

// 页面加载后不显示toast的时间阈值（毫秒）
export const NO_TOAST_TIME_THRESHOLD = 3000
