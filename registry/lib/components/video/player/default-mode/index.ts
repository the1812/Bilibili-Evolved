import { ComponentMetadata, ComponentEntry } from '@/components/types'
import { playerAgent } from '@/components/video/player-agent'
import { sq } from '@/core/spin-query'
import { isEmbeddedPlayer, playerReady } from '@/core/utils'
import { allVideoUrls } from '@/core/utils/urls'

export enum PlayerModes {
  Normal = '常规',
  Wide = '宽屏',
  WebFullscreen = '网页全屏',
  Fullscreen = '全屏',
}
const entry: ComponentEntry = async ({ settings: { options } }) => {
  if (isEmbeddedPlayer()) {
    return
  }
  await playerReady()
  const actions: Map<PlayerModes, () => void | Promise<void>> = new Map([
    [PlayerModes.Normal, none],
    [PlayerModes.Wide, () => {
      playerAgent.widescreen()
    }],
    [PlayerModes.WebFullscreen, () => {
      playerAgent.webFullscreen()
    }],
    [PlayerModes.Fullscreen, async () => {
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
  const video = await playerAgent.query.video.element() as HTMLVideoElement
  if (!video) {
    return
  }
  const action = actions.get(options.mode)
  const onplay = () => {
    const isNormalMode = !dq('body[class*=player-mode-]')
    if (isNormalMode) {
      action()
    }
  }
  if (options.applyOnPlay && !playerAgent.isAutoPlay()) {
    video.addEventListener('play', onplay, { once: true })
  } else {
    onplay()
  }
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
      defaultValue: PlayerModes.Normal,
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
