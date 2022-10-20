import {
  defineComponentMetadata,
  defineOptionsMetadata,
  OptionsOfMetadata,
} from '@/components/define'
import { ComponentEntry } from '@/components/types'
import { playerAgent } from '@/components/video/player-agent'
import { sq } from '@/core/spin-query'
import { disableWindowScroll, isEmbeddedPlayer, playerReady } from '@/core/utils'
import { loadLazyPanel } from '@/core/utils/lazy-panel'
import { allVideoUrls } from '@/core/utils/urls'

export enum PlayerModes {
  Normal = '常规',
  Wide = '宽屏',
  WebFullscreen = '网页全屏',
  Fullscreen = '全屏',
}

const options = defineOptionsMetadata({
  mode: {
    defaultValue: PlayerModes.Normal,
    displayName: '模式选择',
    dropdownEnum: PlayerModes,
  },
  applyOnPlay: {
    defaultValue: false,
    displayName: '播放时应用',
  },
})

export type Options = OptionsOfMetadata<typeof options>

const entry: ComponentEntry<Options> = async ({ settings: { options: options0 } }) => {
  if (isEmbeddedPlayer()) {
    return
  }
  const {
    query: {
      control: { buttons },
    },
  } = playerAgent

  await playerReady()
  Promise.resolve().then(async () => {
    const actions: Map<PlayerModes, () => void | Promise<void>> = new Map([
      [PlayerModes.Normal, none],
      [
        PlayerModes.Wide,
        async () => {
          await loadLazyPanel(buttons.widescreen.selector)
          disableWindowScroll(() => playerAgent.widescreen())
        },
      ],
      [
        PlayerModes.WebFullscreen,
        async () => {
          await loadLazyPanel(buttons.webFullscreen.selector)
          playerAgent.webFullscreen()
        },
      ],
      [
        PlayerModes.Fullscreen,
        async () => {
          const video = await sq(
            () => dq(playerAgent.query.video.element.selector),
            (it: HTMLVideoElement) =>
              it !== null &&
              it.readyState === 4 &&
              document.readyState === 'complete' &&
              document.hasFocus(),
          )
          if (video === null) {
            console.warn('[默认播放器模式] 未能应用全屏模式, 等待超时.')
            return
          }
          // await loadLazyPanel(buttons.fullscreen.selector)
          playerAgent.fullscreen()
        },
      ],
    ])
    const video = (await playerAgent.query.video.element()) as HTMLVideoElement
    if (!video) {
      return
    }
    const action = actions.get(options0.mode)
    // https://github.com/the1812/Bilibili-Evolved/issues/2408
    // 也许以前切P是会刷新页面，但现在(2.7+)的播放器切P是不刷新页面的，所以不需要判断
    // const onplay = () => {
    //   const isNormalMode = !dq('body[class*=player-mode-]')
    //   if (isNormalMode) {
    //     action()
    //   }
    // }
    if (options0.applyOnPlay && !playerAgent.isAutoPlay()) {
      video.addEventListener('play', action, { once: true })
    } else {
      action()
    }
  })
}
export const component = defineComponentMetadata({
  name: 'defaultPlayerMode',
  displayName: '默认播放器模式',
  entry,
  tags: [componentsTags.video],
  description: {
    'zh-CN':
      '控制是否使用默认播放器模式, 可以为`常规`, `宽屏`, `网页全屏`或`全屏`. 注意: 不能和其他影响定位的功能一同使用, 例如播放器定位. (相关讨论: [#483](https://github.com/the1812/Bilibili-Evolved/issues/483))',
    'en-US':
      'Set the default player mode. Could be `Normal`, `Widescreen`, `Web fullscreen` or `Fullscreen`.',
    'ja-JP':
      'デフォルト・プレーヤー・モードが使用するかどうかを制御する、 例えば`常规`、`宽屏`、 `网页全屏`か`全屏`.',
  },
  options,
  urlInclude: allVideoUrls,
})
