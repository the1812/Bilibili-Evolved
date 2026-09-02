import { defineComponentMetadata } from '@/components/define'
import { playerAgent } from '@/components/video/player-agent'
import { lightOff, lightOn } from '@/components/video/player-light'
import { videoChange } from '@/core/observer'
import { addComponentListener, getComponentSettings } from '@/core/settings'
import { allVideoUrls } from '@/core/utils/urls'

enum IntersectionMode {
  Top = '视频顶部',
  Medium = '视频中间',
  Bottom = '视频底部',
}

const name = 'playerIntersectionActions'
const displayName = '播放器位置动作'

export const component = defineComponentMetadata({
  name,
  displayName,
  author: {
    name: 'Waua',
    link: 'https://github.com/FoundTheWOUT',
  },
  tags: [componentsTags.video],
  urlInclude: allVideoUrls,
  entry: async ({ settings: { options }, metadata }) => {
    const settings = options as {
      triggerLocation: IntersectionMode
      pause: boolean
      light: boolean
    }
    Promise.resolve().then(async () => {
      const { playerReady } = await import('@/core/utils')
      const {
        query: { video },
      } = playerAgent

      const videoEl = (await video.element()) as HTMLVideoElement
      // 优先使用 #video-player: 稍后再看 (medialist) 页面也有 .player-wrap, 混用会导致闪烁
      const playerWrap = (document.getElementById('video-player') ??
        (dq('.player-wrap') || dq('.player-module'))) as HTMLElement

      let observer: IntersectionObserver
      let intersectionLock = true // Lock intersection action
      let playerIntersecting = true // 播放器当前是否在视口内, 由 IO 回调维护

      const getToTop = (mode: string): number =>
        ({
          [IntersectionMode.Top]: 1,
          [IntersectionMode.Medium]: 0.5,
          [IntersectionMode.Bottom]: 0,
        }[mode] ?? 0.5)

      const addPlayerOutEvent = () => observer.observe(playerWrap)
      const removePlayerOutEvent = () => observer.unobserve(playerWrap)

      // 自动开灯是否可用: light 选项开启且 playerAutoLight 已启用且未开自动暂停
      const isLightEnabled = () =>
        settings.light && getComponentSettings('playerAutoLight').enabled && !settings.pause

      const intersectingCall = () => {
        if (intersectionLock) {
          return
        }
        intersectionLock = true // relock
        if (settings.pause && videoEl.paused) {
          videoEl.play()
        }
        if (isLightEnabled() && !videoEl.paused) {
          lightOff()
        }
      }

      const disIntersectingCall = () => {
        if (!videoEl.paused) {
          intersectionLock = false
          if (settings.pause) {
            videoEl.pause()
          }
        }
        if (isLightEnabled()) {
          lightOn()
        }
      }

      const createObserver = (mode = settings.triggerLocation) =>
        new IntersectionObserver(
          ([e]) => {
            playerIntersecting = e.isIntersecting
            e.isIntersecting ? intersectingCall() : disIntersectingCall()
          },
          { threshold: getToTop(mode) },
        )

      // 视口外播放时, playerAutoLight 的关灯会覆盖自动开灯;
      // 关灯广播同步派发, 在同一任务内纠正开灯, 避免灯光闪烁
      window.addEventListener('playerLightChange', event => {
        const { lightOn: isLightOn } = (event as CustomEvent<{ lightOn: boolean }>).detail
        if (!isLightOn && isLightEnabled() && !videoEl.paused && !playerIntersecting) {
          intersectionLock = false
          lightOn()
        }
      })

      // 开灯时 left-container 有 scroll-sticky,
      // 小窗模式还会动态写入负 top 导致评论区跳动;
      // 用重要样式一次性强制 relative + top 0
      const { addImportantStyle } = await import('@/core/style')
      addImportantStyle(
        '.left-container { position: relative !important; top: 0 !important; }',
        name,
      )

      await playerReady()

      addComponentListener(`${metadata.name}.triggerLocation`, (value: IntersectionMode) => {
        removePlayerOutEvent()
        observer = createObserver(value)
        addPlayerOutEvent()
      })

      observer = createObserver()
      videoEl.addEventListener('play', addPlayerOutEvent)
      videoEl.addEventListener('ended', removePlayerOutEvent)
      videoChange(() => addPlayerOutEvent())
    })
  },
  options: {
    triggerLocation: {
      defaultValue: IntersectionMode.Medium,
      displayName: '触发位置',
      dropdownEnum: IntersectionMode,
    },
    pause: {
      defaultValue: false,
      displayName: '自动暂停',
    },
    light: {
      defaultValue: true,
      displayName: '自动开灯',
    },
  },
})
