// 视频缩放模式类型定义
export type ScalingMode = 'none' | 'fill' | 'cover' | 'contain' | 'custom'

// 缩放样式配置类型
export type ScalingStyles = {
  [key in ScalingMode]: string
}

// 控制栏下拉菜单项接口
export interface DropdownItem {
  id: ScalingMode
  text: string
  onClick: () => void
}

// 缩放选项配置接口
export interface ScalingOptions {
  scalingMode: ScalingMode
  customScale: number
}

// 缩放状态接口
export interface ScalingState {
  currentScalingMode: ScalingMode
  isCustomScaling: boolean
}
