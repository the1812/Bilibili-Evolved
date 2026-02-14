import {
  defineComponentMetadata,
  defineOptionsMetadata,
  OptionsOfMetadata,
} from '@/components/define'
import { liveUrls } from '@/core/utils/urls'
import { select } from '@/core/spin-query'
import { delay } from '@/core/utils'
import { addComponentListener, getComponentSettings } from '@/core/settings'

// 音量常数配置
const DEFAULT_FOREGROUND_VOLUME = 10
const DEFAULT_BACKGROUND_VOLUME = 3

const options = defineOptionsMetadata({
  foregroundVolume: {
    displayName: '前台音量',
    defaultValue: DEFAULT_FOREGROUND_VOLUME,
    validator: (value: number) => {
      const num = Math.round(value)
      return num >= 0 && num <= 100 ? num : DEFAULT_FOREGROUND_VOLUME
    },
  },
  backgroundVolume: {
    displayName: '后台音量',
    defaultValue: DEFAULT_BACKGROUND_VOLUME,
    validator: (value: number) => {
      const num = Math.round(value)
      return num >= 0 && num <= 100 ? num : DEFAULT_BACKGROUND_VOLUME
    },
  },
  enableLogging: {
    displayName: '启用日志输出',
    defaultValue: true,
  },
})

export type Options = OptionsOfMetadata<typeof options>

let videoElement: HTMLVideoElement | null = null
let isInitialized = false
let currentForegroundVolume = DEFAULT_FOREGROUND_VOLUME / 100
let currentBackgroundVolume = DEFAULT_BACKGROUND_VOLUME / 100

// 事件处理函数
let handleLoadedMetadata: (() => void) | null = null
let handleVisibilityChange: (() => void) | null = null
let handleFocus: (() => void) | null = null
let handleBlur: (() => void) | null = null

// 获取当前直播间号
const getLiveRoomId = (): string => {
  let matched = location.href.match(/live.bilibili.com\/(\d+)/)
  if (matched) {
    return matched[1]
  }
  matched = location.href.match(/live.bilibili.com\/blanc\/(\d+)/)
  return matched ? matched[1] : ''
}

const findVideoElement = async (): Promise<HTMLVideoElement | null> => {
  try {
    const video = await select('video')
    if (video && (video as HTMLVideoElement).readyState > 0) {
      return video as HTMLVideoElement
    }
    return null
  } catch {
    return null
  }
}

const adjustVolume = (enableLogging: boolean) => {
  if (!videoElement) {
    return
  }

  const isForeground = document.visibilityState === 'visible' && document.hasFocus()
  const targetVolume = isForeground ? currentForegroundVolume : currentBackgroundVolume
  const roomId = getLiveRoomId()

  videoElement.volume = Math.max(0, Math.min(1, targetVolume))

  if (enableLogging) {
    console.log(
      `[前后台音量调节] 房间号: ${roomId} - 音量已设置为: ${
        isForeground ? '前台' : '后台'
      } ${Math.round(targetVolume * 100)}%`,
    )
  }
}

const setupVolumeControl = async (enableLogging: boolean): Promise<void> => {
  try {
    videoElement = await findVideoElement()
    const roomId = getLiveRoomId()

    if (!videoElement) {
      if (enableLogging) {
        console.log(`[前后台音量调节] 房间号: ${roomId} - 未找到视频元素，10秒后重试...`)
      }
      await delay(10000)
      return setupVolumeControl(enableLogging)
    }

    adjustVolume(enableLogging)

    if (!isInitialized) {
      handleLoadedMetadata = () => {
        if (videoElement) {
          adjustVolume(enableLogging)
        }
      }

      handleVisibilityChange = () => adjustVolume(enableLogging)
      handleFocus = () => adjustVolume(enableLogging)
      handleBlur = () => adjustVolume(enableLogging)

      videoElement.addEventListener('loadedmetadata', handleLoadedMetadata)
      document.addEventListener('visibilitychange', handleVisibilityChange)
      window.addEventListener('focus', handleFocus)
      window.addEventListener('blur', handleBlur)

      isInitialized = true

      if (enableLogging) {
        console.log(`[前后台音量调节] 房间号: ${roomId} - B站直播音量自动调节器已激活`)
      }
    }

    return Promise.resolve()
  } catch (error) {
    const roomId = getLiveRoomId()
    if (enableLogging) {
      console.error(`[前后台音量调节] 房间号: ${roomId} - 设置音量控制时出错:`, error)
    }
    return Promise.resolve()
  }
}

export const component = defineComponentMetadata({
  name: 'frontBackVolume',
  displayName: '直播前后台音量自动调节',
  description: '自动调节B站直播音量，前台和后台使用不同音量',
  author: {
    name: 'KDH-KDHKDH',
    link: 'https://github.com/KDH-KDHKDH',
  },
  tags: [componentsTags.live],
  urlInclude: liveUrls,
  entry: async ({ settings, metadata }) => {
    const { foregroundVolume, backgroundVolume, enableLogging } = settings.options

    currentForegroundVolume = foregroundVolume / 100
    currentBackgroundVolume = backgroundVolume / 100

    addComponentListener(`${metadata.name}.foregroundVolume`, (newVolume: number) => {
      currentForegroundVolume = newVolume / 100
      adjustVolume(enableLogging)
    })

    addComponentListener(`${metadata.name}.backgroundVolume`, (newVolume: number) => {
      currentBackgroundVolume = newVolume / 100
      adjustVolume(enableLogging)
    })

    const observer = new MutationObserver(() => {
      if (!videoElement || !document.contains(videoElement)) {
        setupVolumeControl(enableLogging)
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    await delay(2000)
    await setupVolumeControl(enableLogging)
  },
  options,
  reload: async () => {
    const settings = getComponentSettings<Options>('frontBackVolume')

    if (videoElement && handleLoadedMetadata) {
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
    if (handleVisibilityChange) {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
    if (handleFocus) {
      window.removeEventListener('focus', handleFocus)
    }
    if (handleBlur) {
      window.removeEventListener('blur', handleBlur)
    }

    isInitialized = false
    videoElement = null

    handleLoadedMetadata = null
    handleVisibilityChange = null
    handleFocus = null
    handleBlur = null

    currentForegroundVolume = settings.options.foregroundVolume / 100
    currentBackgroundVolume = settings.options.backgroundVolume / 100

    await setupVolumeControl(settings.options.enableLogging)
  },
  unload: () => {
    if (videoElement && handleLoadedMetadata) {
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
    if (handleVisibilityChange) {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
    if (handleFocus) {
      window.removeEventListener('focus', handleFocus)
    }
    if (handleBlur) {
      window.removeEventListener('blur', handleBlur)
    }

    isInitialized = false
    videoElement = null

    handleLoadedMetadata = null
    handleVisibilityChange = null
    handleFocus = null
    handleBlur = null

    currentForegroundVolume = DEFAULT_FOREGROUND_VOLUME / 100
    currentBackgroundVolume = DEFAULT_BACKGROUND_VOLUME / 100
  },
})
