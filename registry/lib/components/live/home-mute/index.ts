import { defineComponentMetadata } from '@/components/define'
import { addComponentListener } from '@/core/settings'
import { addStyle, removeStyle } from '@/core/style'

const liveHome = /^https:\/\/live\.bilibili\.com\/(index\.html)?$/
export const component = defineComponentMetadata({
  name: 'liveHomeMute',
  displayName: '直播首页静音',
  tags: [componentsTags.live],
  description: {
    'zh-CN': '禁止直播首页的推荐直播间自动开始播放.',
  },
  entry: async ({ metadata }) => {
    const styleID = 'hide-home-live'
    addComponentListener(
      `${metadata.name}.hide`,
      (value: boolean) => {
        if (value) {
          addStyle('.player-area-ctnr,#player-header { display: none !important }', styleID)
        } else {
          removeStyle(styleID)
        }
      },
      true,
    )
  },
  options: {
    hide: {
      displayName: '隐藏首页直播板块',
      defaultValue: false,
    },
  },
  urlInclude: [liveHome],
  plugin: {
    displayName: '直播首页静音 - 提前执行',
    description: {
      'zh-CN': '提前执行代码以尽快静音.',
    },
    async setup() {
      const { isComponentEnabled } = await import('@/core/settings')
      if (!isComponentEnabled('liveHomeMute')) {
        return
      }
      const { matchUrlPattern } = await import('@/core/utils')
      if (!matchUrlPattern(liveHome)) {
        return
      }
      const { select } = await import('@/core/spin-query')
      select('video').then((video: HTMLVideoElement) => {
        video.muted = true
      })
    },
  },
})
