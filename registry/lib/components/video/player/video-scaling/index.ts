import { defineComponentMetadata } from '@/components/define'
import { playerAgent } from '@/components/video/player-agent'
import { addComponentListener } from '@/core/settings'
import './styles.scss'

// 定义缩放预设选项类型
type ScalePreset = '1.0x' | '1.25x' | '1.5x' | '2.0x' | 'custom'

const SCALE_MAPPING: Record<ScalePreset, number> = {
  '1.0x': 1.0,
  '1.25x': 1.25,
  '1.5x': 1.5,
  '2.0x': 2.0,
  custom: 1.0,
}

export const component = defineComponentMetadata({
  name: 'videoScaling',
  displayName: '视频缩放',
  description: '允许调整视频的显示缩放比例',
  tags: [componentsTags.video],
  options: {
    scalePreset: {
      defaultValue: '1.0x' as ScalePreset,
      displayName: '缩放比例预设',
      dropdownEnum: ['1.0x', '1.25x', '1.5x', '2.0x', 'custom'],
    },
    customScale: {
      defaultValue: 1.0,
      displayName: '自定义缩放比例',
      slider: {
        min: 0.5,
        max: 3.0,
        step: 0.1,
      },
    },
  },
  entry: ({ settings }) => {
    // 当前缩放比例
    let currentScale = 1.0
    const maxScale = 3.0
    const minScale = 0.5

    // 显示缩放比例提示
    const showScaleToast = (scale: number) => {
      try {
        // 创建一个临时的toast元素显示缩放比例
        let toast = document.querySelector('.be-video-scale-toast') as HTMLDivElement
        if (!toast) {
          toast = document.createElement('div')
          toast.className = 'be-video-scale-toast'
          toast.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            z-index: 9999;
            font-size: 16px;
            pointer-events: none;
          `
          document.body.appendChild(toast)
        }
        toast.textContent = `缩放: ${Math.round(scale * 100)}%`

        // 3秒后移除提示
        clearTimeout((toast as any).timeoutId)
        ;(toast as any).timeoutId = setTimeout(() => {
          toast.remove()
        }, 3000)
      } catch (error) {
        console.error('显示缩放提示失败', error)
      }
    }

    // 获取视频元素并应用缩放
    const applyScale = async () => {
      try {
        // 使用playerAgent API获取视频元素
        const videoElement = await playerAgent.query.video.element()
        if (videoElement) {
          // 应用transform: scale()样式
          videoElement.style.transform = `scale(${currentScale})`
          videoElement.style.transformOrigin = 'center'
        }
      } catch (error) {
        console.error('视频缩放: 无法获取视频元素', error)
      }
    }

    // 根据设置更新缩放
    const updateScaleFromSettings = async () => {
      const preset = settings.options.scalePreset as ScalePreset

      if (preset === 'custom') {
        currentScale = settings.options.customScale as number
      } else {
        currentScale = SCALE_MAPPING[preset]
      }

      await applyScale()
      showScaleToast(currentScale)
    }

    // 监听缩放预设变化
    const onScalePresetChange = async () => {
      await updateScaleFromSettings()
    }

    // 监听自定义缩放变化
    const onCustomScaleChange = async (newValue: number) => {
      // 确保值在有效范围内
      currentScale = Math.max(minScale, Math.min(maxScale, newValue))
      await applyScale()
      showScaleToast(currentScale)
    }

    // 使用addComponentListener监听设置变化
    addComponentListener('videoScaling.scalePreset', onScalePresetChange)
    addComponentListener('videoScaling.customScale', onCustomScaleChange)

    // 初始化缩放
    updateScaleFromSettings().catch(err => {
      console.error('初始化视频缩放失败', err)
    })

    // 监听视频切换，重置缩放
    import('@/core/observer')
      .then(({ videoChange }) => {
        videoChange(() => {
          updateScaleFromSettings().catch(err => {
            console.error('重置视频缩放失败', err)
          })
        })
      })
      .catch(err => {
        console.error('导入observer失败', err)
      })
  },
  reload: () => {
    // 重新加载组件时执行清理
    document.querySelectorAll('.be-video-scale-toast').forEach(el => el.remove())
  },
})
