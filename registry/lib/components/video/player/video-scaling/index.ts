import { addComponentListener } from '@/core/settings'
import { defineComponentMetadata } from '@/components/define'
import { componentsTags } from '@/components/component'
import { videoChange } from '@/core/observer'
import { ScaleState, applyScale, updateScaleFromSettings } from './scale-service'
import { showScaleToast, cleanupToasts, handleError } from './ui-utils'
import {
  CUSTOM_SCALE_CONFIG,
  SCALE_PRESETS,
  TOAST_DURATION_CONFIG,
  NO_TOAST_TIME_THRESHOLD,
} from './constants'
import { ScalePreset } from './types'
import './styles.scss'

// 创建选项元数据对象，用于动态修改
const customScaleOption = {
  defaultValue: 100, // 100%
  displayName: '自定义缩放比 (%)',
  slider: {
    min: CUSTOM_SCALE_CONFIG.min,
    max: CUSTOM_SCALE_CONFIG.max,
    step: CUSTOM_SCALE_CONFIG.step,
  },
  formatValue: (value: number) => value,
  hidden: true,
}

// 创建toastDuration选项元数据对象
const toastDurationOption = {
  defaultValue: TOAST_DURATION_CONFIG.defaultValue,
  displayName: '提示显示时间 (秒)',
  slider: {
    min: TOAST_DURATION_CONFIG.min,
    max: TOAST_DURATION_CONFIG.max,
    step: TOAST_DURATION_CONFIG.step,
  },
  hidden: false, // 默认显示
}

export const component = defineComponentMetadata({
  name: 'videoScaling',
  displayName: '视频缩放',
  description: '允许调整视频的显示缩放比例',
  tags: [componentsTags.video],
  options: {
    scalePreset: {
      defaultValue: '100%' as ScalePreset,
      displayName: '缩放比例预设',
      dropdownEnum: [...SCALE_PRESETS],
    },
    customScale: customScaleOption,
    showToast: {
      defaultValue: true,
      displayName: '显示缩放提示',
    },
    toastDuration: toastDurationOption,
  },
  entry: async ({ settings }) => {
    // 缩放状态管理
    const scaleState = new ScaleState()

    // 记录页面加载时间
    const pageLoadTime = Date.now()

    // 初始化时根据showToast状态设置toastDuration的可见性
    toastDurationOption.hidden = !settings.options.showToast

    // 监听showToast变化，动态控制toastDuration的可见性
    const onShowToastChange = (showToast: boolean) => {
      toastDurationOption.hidden = !showToast
    }

    // 统一的应用缩放和显示提示逻辑
    const applyScaleAndShowToast = async (scale: number): Promise<void> => {
      try {
        await applyScale(scale)

        // 检查是否启用了toast显示，且缩放比例不是100%，且已过3秒加载时间
        const currentTime = Date.now()
        const hasPassedInitialTime = currentTime - pageLoadTime >= NO_TOAST_TIME_THRESHOLD

        if (settings.options.showToast && scale !== 100 && hasPassedInitialTime) {
          showScaleToast(scale, settings.options.toastDuration as number)
        }
      } catch (error) {
        handleError('应用缩放和显示提示', error)
      }
    }

    // 根据设置更新缩放
    const handleUpdateScaleFromSettings = async (): Promise<void> => {
      try {
        const preset = settings.options.scalePreset as ScalePreset

        // 当预设为自定义时显示滑动条，否则隐藏
        customScaleOption.hidden = preset !== '自定义'

        const newScale = updateScaleFromSettings(
          preset,
          settings.options.customScale as number,
          scaleState,
        )

        await applyScaleAndShowToast(newScale)
      } catch (error) {
        handleError('根据设置更新缩放', error)
      }
    }

    // 监听自定义缩放变化
    const handleCustomScaleChange = async (newValue: number): Promise<void> => {
      try {
        const preset = settings.options.scalePreset as ScalePreset
        if (preset === '自定义') {
          // 确保值在有效范围内
          const newScale = updateScaleFromSettings(preset, newValue, scaleState)

          await applyScaleAndShowToast(newScale)
        }
      } catch (error) {
        handleError('处理自定义缩放变化', error)
      }
    }

    // 添加设置监听器
    addComponentListener('videoScaling.scalePreset', handleUpdateScaleFromSettings)
    addComponentListener('videoScaling.customScale', handleCustomScaleChange)
    addComponentListener('videoScaling.showToast', onShowToastChange)

    // 初始化缩放
    try {
      await handleUpdateScaleFromSettings()
    } catch (error) {
      handleError('初始化视频缩放', error)
    }

    // 监听视频切换，重置缩放
    try {
      // 不存储返回值，直接调用videoChange
      videoChange(async () => {
        try {
          await handleUpdateScaleFromSettings()
        } catch (error) {
          handleError('重置视频缩放', error)
        }
      })
    } catch (error) {
      handleError('导入observer', error)
    }

    // 清理函数，在组件卸载时调用
    return () => {
      // 清理所有toast元素
      cleanupToasts()
    }
  },
  reload: () => {
    // 重新加载组件时执行清理
    cleanupToasts()
  },
})
