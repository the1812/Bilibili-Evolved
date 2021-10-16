import { ComponentMetadata, ComponentEntry } from '@/components/types'
import { playerAgent } from '@/components/video/player-agent'
import { videoChange } from '@/core/observer'
import { sq } from '@/core/spin-query'
import { isEmbeddedPlayer } from '@/core/utils'
import { allVideoUrls } from '@/core/utils/urls'

export enum PlayerModes {
  normal = '常规',
  wide = '宽屏',
  webFullscreen = '网页全屏',
  fullscreen = '全屏',
}
const entry: ComponentEntry = async ({ settings: { options } }) => {
  if (isEmbeddedPlayer()) {
    return
  }
  videoChange(async () => {
    const actions: Map<PlayerModes, () => void | Promise<void>> = new Map([
      [PlayerModes.normal, none],
      [PlayerModes.wide, () => {
        playerAgent.widescreen()
      }],
      [PlayerModes.webFullscreen, () => {
        playerAgent.webFullscreen()
      }],
      [PlayerModes.fullscreen, async () => {
        const video = await sq(
          () => dq(playerAgent.query.video.element.selector),
          (it: HTMLVideoElement) => it !== null && it.readyState === 4
            && document.readyState === 'complete' && document.hasFocus(),
        )
        if (video === null) {
          console.warn('[默认播放器模式] 未能应用全屏模式, 等待超时.')
          return
        }
        playerAgent.fullscreen()
      }],
    ])

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
      const isNormalMode = !dq('#bilibiliPlayer[class*=mode-]')
      if (isNormalMode) {
        action()
      }
    }
    if (options.applyOnPlay && !autoPlay) {
      video.addEventListener('play', onplay, { once: true })
    } else {
      onplay()
    }
  })
}
export const component: ComponentMetadata = {
  name: 'defaultPlayerMode',
  displayName: '默认播放器模式',
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
  },
  urlInclude: allVideoUrls,
}
