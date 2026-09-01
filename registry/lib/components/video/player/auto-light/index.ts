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
      on ? lightOn() : lightOff()
    }

    // 星光动画跟随灯光状态, starAnimation 选项在此统一控制
    const setStars = (isLightOff: boolean) => StarAnim(isLightOff && settings.options.starAnimation)

    // 任何组件开关灯都经过 PlayerAgent.toggleLight, 监听其广播的灯光状态同步星光动画
    window.addEventListener('playerLightChange', event => {
      const { lightOn: isLightOn } = (event as CustomEvent<{ lightOn: boolean }>).detail
      setStars(!isLightOn)
    })

    // 用户手动点击播放器设置中的 "关灯模式" 勾选框时同步星光动画 (该路径不经过 PlayerAgent.toggleLight)
    document.addEventListener(
      'change',
      event => {
        const checkbox = event.target
        if (
          checkbox instanceof HTMLInputElement &&
          checkbox.closest('.bpx-player-ctrl-setting-lightoff')
        ) {
          setStars(checkbox.checked)
        }
      },
      true,
    )

    // 在 document 上捕获事件, 避免视频元素被替换后监听器失效，导致卡在关灯状态
    // 限定主播放器挂载点 (#bilibili-player 为视频/番剧页, #edu-player 为课堂页), 推荐卡片预览是独立 bpx 实例, 不能误触发
    const onVideoEvent = (type: string, on: boolean) => {
      document.addEventListener(
        type,
        event => {
          if (
            event.target instanceof Element &&
            event.target.closest(
              '#bilibili-player .bpx-player-video-area, #edu-player .bpx-player-video-area',
            )
          ) {
            setLight(on)
          }
        },
        true,
      )
    }
    onVideoEvent('play', false)
    onVideoEvent('pause', true)
    onVideoEvent('ended', true)

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
