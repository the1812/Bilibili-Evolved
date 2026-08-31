import { playerAgent } from '@/components/video/player-agent'
import { lightOn, lightOff } from '@/components/video/player-light'
import { videoChange } from '@/core/observer'
import { allVideoUrls } from '@/core/utils/urls'
import { StarAnim } from './animation'
import { defineComponentMetadata } from '@/components/define'

export const component = defineComponentMetadata({
  name: 'playerAutoLight',
  displayName: '播放时自动关灯',
  urlInclude: allVideoUrls,
  tags: [componentsTags.video],
  options: {
    starAnimation: {
      defaultValue: true,
      displayName: '启用星光动画',
    },
  },
  entry: async ({ settings }) => {
    const { isEmbeddedPlayer, playerReady } = await import('@/core/utils')

    if (isEmbeddedPlayer()) {
      return
    }

    // 等待播放器完成初始化, 过早调用关灯 API 可能与 b 站自身的初始化竞争并触发页面自动刷新
    // https://github.com/the1812/Bilibili-Evolved/issues/5125
    const waitPlayerReady = lodash.once(() =>
      playerReady().catch(() => {
        // 播放器就绪信号不可用时直接继续, 避免关灯功能完全失效
      }),
    )

    const setLight = async (on: boolean) => {
      await waitPlayerReady()
      if (on) {
        lightOn()
        StarAnim(false)
      } else {
        lightOff()
        if (settings.options.starAnimation) {
          StarAnim(true)
        }
      }
    }

    // 在 document 上捕获事件, 避免视频元素被替换后监听器失效，导致卡在关灯状态
    const onVideoEvent = (type: string, action: () => void) => {
      document.addEventListener(
        type,
        event => {
          if (event.target instanceof Element && event.target.closest('.bpx-player-video-area')) {
            action()
          }
        },
        true,
      )
    }
    onVideoEvent('play', () => setLight(false))
    onVideoEvent('pause', () => setLight(true))
    onVideoEvent('ended', () => setLight(true))

    videoChange(async () => {
      const video = (await playerAgent.query.video.element()) as HTMLVideoElement
      // 组件加载前视频可能已经开始播放
      waitPlayerReady().then(() => {
        if (!video.paused && !video.ended) {
          setLight(false)
        }
      })
    })
  },
})
