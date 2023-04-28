import { defineComponentMetadata } from '@/components/define'
import { playerAgent } from '@/components/video/player-agent'
import { lightOff, lightOn } from '@/components/video/player-light'
import { videoChange } from '@/core/observer'
import { addComponentListener, getComponentSettings } from '@/core/settings'
import { allVideoUrls } from '@/core/utils/urls'
import { StarAnim } from './animation'

enum IntersectionMode {
  Top = '视频顶部',
  Medium = '视频中间',
  Bottom = '视频底部',
}

export const component = defineComponentMetadata({
  name: 'playerIntersectionActions',
  author: {
    name: 'FoundTheWOUT',
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

      function getToTop(_mode: string): number {
        switch (_mode) {
          case IntersectionMode.Top:
            return 1
          case IntersectionMode.Medium:
            return 0.5
          case IntersectionMode.Bottom:
            return 0
          default:
            return 0.5
        }
      }

      function addPlayerOutEvent() {
        // window.addEventListener('scroll', onPlayerOutEvent, { passive: true });
        observer.observe(playerWrap)
      }

      function removePlayerOutEvent() {
        // window.removeEventListener('scroll', onPlayerOutEvent);
        observer.unobserve(playerWrap)
      }

      const intersectingCall = () => {
        if (intersectionLock) {
          return
        }
        intersectionLock = true // relock
        if (settings.pause && videoEl.paused) {
          videoEl.play()
        }
        if (
          settings.light &&
          getComponentSettings('playerAutoLight').enabled &&
          !settings.pause &&
          !videoEl.paused
        ) {
          lightOff()
          if (settings.options.starAnimation) {
            StarAnim(true)
          }
        }
      }

      const disIntersectingCall = () => {
        // if video is playing, unlock intersecting action
        if (!videoEl.paused) {
          intersectionLock = false
        }
        if (settings.pause && !videoEl.paused) {
          videoEl.pause()
        }
        if (settings.light && getComponentSettings('playerAutoLight').enabled && !settings.pause) {
          lightOn()
          StarAnim(false)
        }
      }

      const createObserver = (mode?: string) =>
        new IntersectionObserver(
          ([e]) => {
            e.isIntersecting ? intersectingCall() : disIntersectingCall()
          },
          {
            threshold: getToTop(mode || settings.triggerLocation),
          },
        )

      function mountPlayListener() {
        videoChange(async () => {
          if (playerAgent.isAutoPlay()) {
            addPlayerOutEvent()
          }
          videoEl.addEventListener('play', addPlayerOutEvent)
          // videoEl.addEventListener('pause', removePlayerOutEvent);
          videoEl.addEventListener('ended', removePlayerOutEvent)
        })
      }

      addComponentListener(`${metadata.name}.triggerLocation`, (value: IntersectionMode) => {
        removePlayerOutEvent()
        observer = createObserver(value)
        addPlayerOutEvent()
      })

      observer = createObserver()
      mountPlayListener()
    })
  },
  displayName: '播放器位置动作',
  description: {
    'zh-CN': '设置当播放器移出视图的位置变化时执行的动作.',
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
