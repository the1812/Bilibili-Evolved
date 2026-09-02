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

export const component = defineComponentMetadata({
  name: 'playerIntersectionActions',
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
      // const playerWrap = await video.wrap()
      // 如果有 video-player 优先的使用该盒子
      // 因为在稍后再看页面（medialist）视频也有 player-wrap
      // 选择 player-wrap 会导致闪烁。
      const playerWrap = (document.getElementById('video-player') ??
        (dq('.player-wrap') || dq('.player-module'))) as HTMLElement

      let observer: IntersectionObserver
      let intersectionLock = true // Lock intersection action
      let playerIntersecting = true // 播放器当前是否在视口内 (由 IO 回调维护)

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

      // 视口外播放时, playerAutoLight 的关灯会覆盖自动开灯
      // 同一任务内纠正可避免闪烁.
      window.addEventListener('playerLightChange', event => {
        const { lightOn: isLightOn } = (event as CustomEvent<{ lightOn: boolean }>).detail
        if (!isLightOn && isLightEnabled() && !videoEl.paused && !playerIntersecting) {
          intersectionLock = false
          lightOn()
        }
      })

      await playerReady()

      // 强制 relative 让播放器随页面正常滚出, 与关灯模式几何一致
      const leftContainer = dq('.left-container') as HTMLElement | null
      if (leftContainer) {
        leftContainer.style.position = 'relative'
        // 短页面切换到小窗模式时, b 站会给 left-container 加负 top 把容器整体上移,
        // 导致评论区瞬间跳动; 重置为 0 保持布局位置不变
        new MutationObserver(() => {
          if (parseFloat(leftContainer.style.top) < 0) {
            leftContainer.style.top = '0px'
          }
        }).observe(leftContainer, { attributes: true, attributeFilter: ['style'] })
      }

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
  displayName: '播放器位置动作',
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
