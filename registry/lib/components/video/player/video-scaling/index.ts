import { addComponentListener, getComponentSettings } from '@/core/settings'
import { videoChange } from '@/core/observer'
import { defineComponentMetadata } from '@/components/define'
import { addControlBarButton } from '@/components/video/video-control-bar'
import { ScaleState, applyScale, updateScaleFromSettings } from './scale-service'
import { showScaleToast, cleanupToasts, handleError } from './ui-utils'
import {
  CUSTOM_SCALE_CONFIG,
  SCALE_MAPPING,
  SCALE_PRESETS,
  TOAST_DURATION_CONFIG,
  NO_TOAST_TIME_THRESHOLD,
} from './constants'
import { ScalePreset } from './types'
import desc from './index.md'

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

// 维护控制栏按钮状态的变量
let controlBarButtonAdded = false

// 切换控制栏按钮显示状态的函数
let toggleControlBarButton: ((showButton: boolean) => Promise<void>) | null = null

export const component = defineComponentMetadata({
  author: { name: 'weedy233', link: 'https://github.com/weedy233' },
  name: 'videoScaling',
  displayName: '视频缩放',
  description: desc,
  tags: [componentsTags.video],
  instantStyles: [{ name: 'videoScaling', style: () => import('./styles.scss') }],
  options: {
    scalePreset: {
      defaultValue: '100%' as ScalePreset,
      displayName: '缩放比例',
      dropdownEnum: [...SCALE_PRESETS],
    },
    customScale: customScaleOption,
    showToast: {
      defaultValue: true,
      displayName: '显示缩放提示',
    },
    toastDuration: toastDurationOption,
    showControlBarButton: {
      defaultValue: true,
      displayName: '显示控制栏按钮',
    },
  },
  entry: async ({ settings }) => {
    const scaleState = new ScaleState()

    // 记录页面加载时间和视频切换时间
    const pageLoadTime = Date.now()
    let videoChangeTime = pageLoadTime

    toastDurationOption.hidden = !settings.options.showToast

    const onShowToastChange = (showToast: boolean) => {
      toastDurationOption.hidden = !showToast
    }

    // 统一的应用缩放和显示提示逻辑
    const applyScaleAndShowToast = async (scale: number): Promise<void> => {
      try {
        await applyScale(scale)

        // 检查是否启用了toast显示，且缩放比例不是100%，且已过3秒加载时间或视频切换时间
        const currentTime = Date.now()
        const hasPassedPageLoadTime = currentTime - pageLoadTime >= NO_TOAST_TIME_THRESHOLD
        const hasPassedVideoChangeTime = currentTime - videoChangeTime >= NO_TOAST_TIME_THRESHOLD

        if (
          settings.options.showToast &&
          scale !== 100 &&
          hasPassedPageLoadTime &&
          hasPassedVideoChangeTime
        ) {
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
          // 记录视频切换时间
          videoChangeTime = Date.now()
          await handleUpdateScaleFromSettings()
        } catch (error) {
          handleError('重置视频缩放', error)
        }
      })
    } catch (error) {
      handleError('导入observer', error)
    }

    // 创建切换控制栏按钮显示状态的函数
    toggleControlBarButton = async (showButton: boolean) => {
      try {
        if (showButton && !controlBarButtonAdded) {
          await addControlBarButton({
            name: 'videoScaling',
            displayName: '视频缩放',
            icon: 'mdi-magnify',
            order: 100,
            action: async () => {
              try {
                // 获取当前的缩放比例
                const currentScale = scaleState.get()

                // 创建不包含"自定义"的预设比例数组
                const presetScales = SCALE_PRESETS.filter(preset => preset !== '自定义')

                // 找到当前缩放比例在数组中的索引
                let currentIndex = -1
                for (let i = 0; i < presetScales.length; i++) {
                  if (SCALE_MAPPING[presetScales[i]] === currentScale) {
                    currentIndex = i
                    break
                  }
                }

                // 如果找不到完全匹配的缩放比例，从当前最接近的比例开始
                if (currentIndex === -1) {
                  currentIndex = presetScales.indexOf('100%')
                }

                // 计算下一个缩放比例的索引（循环）
                const nextIndex = (currentIndex + 1) % presetScales.length
                const nextPreset = presetScales[nextIndex]
                const nextScale = SCALE_MAPPING[nextPreset]

                // 更新设置中的缩放预设
                settings.options.scalePreset = nextPreset

                // 应用新的缩放比例
                await applyScaleAndShowToast(nextScale)
              } catch (error) {
                console.error('视频缩放: 循环切换缩放倍数时出错', error)
              }
            },
          })
          controlBarButtonAdded = true
        } else if (!showButton && controlBarButtonAdded) {
          controlBarButtonAdded = false
        }
      } catch (error) {
        handleError('切换视频缩放控制栏按钮显示状态', error)
      }
    }

    // 添加showControlBarButton设置的监听器
    addComponentListener('videoScaling.showControlBarButton', toggleControlBarButton)

    // 初始化时根据设置决定是否添加控制栏按钮
    try {
      if (settings.options.showControlBarButton) {
        await toggleControlBarButton(true)
      }
    } catch (error) {
      handleError('初始化视频缩放控制栏按钮', error)
    }
  },
  unload: () => {
    cleanupToasts()
  },
  reload: async () => {
    const settings = getComponentSettings('videoScaling')
    if (settings && settings.options.scalePreset) {
      if (
        settings.options.scalePreset &&
        typeof settings.options.scalePreset === 'string' &&
        settings.options.scalePreset in SCALE_MAPPING
      ) {
        await applyScale(SCALE_MAPPING[settings.options.scalePreset as keyof typeof SCALE_MAPPING])
      }
    }
  },
})
