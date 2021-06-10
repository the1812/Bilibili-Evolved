import { ComponentMetadata, componentsTags } from '@/components/component'
import { ComponentSettings } from '@/core/settings'
import { playerUrls } from '../player-urls'

export enum PlayerModes {
  normal = '常规',
  wide = '宽屏',
  webFullscreen = '网页全屏',
  fullscreen = '全屏',
}
const entry = async ({ options }: ComponentSettings) => {
  const {
    none, dq, dqa, isEmbeddedPlayer, raiseEvent,
  } = await import('@/core/utils')
  const { videoChange } = await import('@/core/observer')
  const {
    sq, select,
  } = await import('@/core/spin-query')
  const { loadLazyPlayerSettingsPanel } = await import('@/core/utils/lazy-panel')

  if (isEmbeddedPlayer()) {
    return
  }
  videoChange(async () => {
    const actions: Map<PlayerModes, () => void | Promise<void>> = new Map([
      [PlayerModes.normal, none],
      [PlayerModes.wide, () => {
        const button = dq('.bilibili-player-video-btn-widescreen') as HTMLElement
        button.click()
      }],
      [PlayerModes.webFullscreen, () => {
        const button = dq('.bilibili-player-video-web-fullscreen') as HTMLElement
        button.click()
      }],
      [PlayerModes.fullscreen, async () => {
        const video = await sq(
          () => dq('.bilibili-player-video video'),
          (it: HTMLVideoElement) => it !== null && it.readyState === 4
            && document.readyState === 'complete' && document.hasFocus(),
        )
        if (video === null) {
          console.warn('[默认播放器模式] 未能应用全屏模式, 等待超时.')
          return
        }
        const button = dq('.bilibili-player-video-btn-fullscreen') as HTMLElement
        button.click()
      }],
    ])
    let lightOff = none
    let lightOn = none
    const initLights = async () => {
      if (options.autoLightOff) {
        await loadLazyPlayerSettingsPanel(
          '.bilibili-player-video-btn-setting',
          '.bilibili-player-video-btn-setting-wrap',
          {},
        )
        const setLight = async (off: boolean) => {
          console.log('check', !off)
          const checkbox = await select('.bilibili-player-video-btn-setting-right-others-content-lightoff .bui-checkbox-input') as HTMLInputElement
          console.log(checkbox)
          checkbox.checked = off
          raiseEvent(checkbox, 'change')
        }
        lightOff = () => setLight(true)
        lightOn = () => setLight(false)
      }
    }
    await initLights()
    await sq(
      () => dqa('.bilibili-player-video,.bilibili-player-video-btn-start,.bilibili-player-area'),
      it => {
        if (it.length !== 3) {
          return false
        }
        const video = dq('video') as HTMLVideoElement
        return Boolean(video?.duration ?? 0)
      },
    )

    const video = dq('video') as HTMLVideoElement
    if (!video) {
      return
    }
    const autoPlay = lodash.get(
      JSON.parse(localStorage.getItem('bilibili_player_settings')),
      'video_status.autoplay',
      false,
    )
    const action = actions.get(options.mode)
    const onplay = () => {
      if (!dq('#bilibiliPlayer[class*=mode-]')) {
        action()
      }
    }
    if (options.applyOnPlay && !autoPlay) {
      video.addEventListener('play', onplay, { once: true })
    } else {
      onplay()
    }

    if (autoPlay) {
      lightOff()
    }
    video.addEventListener('ended', lightOn)
    video.addEventListener('pause', lightOn)
    video.addEventListener('play', lightOff)
  })
}
export const component: ComponentMetadata = {
  name: 'defaultPlayerMode',
  displayName: '默认播放器模式',
  enabledByDefault: false,
  entry,
  tags: [componentsTags.video],
  description: {
    'zh-CN': '控制是否使用默认播放器模式, 可以为`常规`, `宽屏`, `网页全屏`或`全屏`.',
    'en-US': 'Set the default player mode. Could be `Normal`, `Widescreen`, `Web fullscreen` or `Fullscreen`.',
    'ja-JP': 'デフォルト・プレーヤー・モードが使用するかどうかを制御する、 例えば`常规`、`宽屏`、 `网页全屏`か`全屏`.',
  },
  options: {
    mode: {
      defaultValue: PlayerModes.normal,
      displayName: '模式选择',
      dropdownEnum: PlayerModes,
    },
    applyOnPlay: {
      defaultValue: false,
      displayName: '播放时应用',
    },
    autoLightOff: {
      defaultValue: false,
      displayName: '自动关灯',
    },
  },
  urlInclude: playerUrls,
}
