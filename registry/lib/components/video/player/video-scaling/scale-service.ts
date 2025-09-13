import { playerAgent } from '@/components/video/player-agent'
import { SCALE_MAPPING, CUSTOM_SCALE_CONFIG } from './constants'
import { ScalePreset } from './types'

// 缩放状态管理
export class ScaleState {
  private currentScale = 1.0

  get(): number {
    return this.currentScale
  }

  set(value: number): void {
    this.currentScale = value
  }
}

// 应用缩放效果
export async function applyScale(scale: number): Promise<void> {
  try {
    // 使用playerAgent API获取视频元素
    const videoElement = await playerAgent.query.video.element()
    if (videoElement) {
      // 应用transform: scale()样式
      videoElement.style.transform = `scale(${scale})`
      videoElement.style.transformOrigin = 'center'
    }
  } catch (error) {
    console.error('视频缩放: 无法获取视频元素', error)
  }
}

// 从设置更新缩放值
export function updateScaleFromSettings(
  preset: ScalePreset,
  customScale: number,
  scaleState: ScaleState,
): number {
  // 确保值在有效范围内
  if (preset === '自定义') {
    const clampedValue = Math.max(
      CUSTOM_SCALE_CONFIG.min,
      Math.min(CUSTOM_SCALE_CONFIG.max, customScale),
    )
    scaleState.set(clampedValue / 100) // 转换为小数
  } else {
    scaleState.set(SCALE_MAPPING[preset])
  }

  return scaleState.get()
}
