import { defineComponentMetadata } from '@/components/define'
import { addComponentListener } from '@/core/settings'
import { addStyle, removeStyle } from '@/core/style'

const liveHome = /^https:\/\/live\.bilibili\.com\/(index\.html)?$/
export const component = defineComponentMetadata({
  name: 'liveHomePause',
  displayName: '直播首页暂停',
  tags: [componentsTags.live],
  author: {
    name: 'YiJay99',
    link: 'https://github.com/YiJay99',
  },
  entry: async ({ metadata }) => {
    const { select } = await import('@/core/spin-query')
    select('video').then((video: HTMLVideoElement) => {
      video.pause()
    })
    const styleID = 'hide-HL'
    addComponentListener(
      `${metadata.name}.hide`,
      (value: boolean) => {
        if (value) {
          addStyle('.player-area-ctnr,#player-header,#blive-home .flex.items-stretch.pr-20px  { display: none !important }', styleID)
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
})
