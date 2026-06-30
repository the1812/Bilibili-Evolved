import { defineComponentMetadata } from '@/components/define'

const liveHome = /^https:\/\/live\.bilibili\.com\/(index\.html)?$/
export const component = defineComponentMetadata({
  name: 'liveHomePause',
  displayName: '直播首页暂停',
  tags: [componentsTags.live],
  description: {
    'zh-CN': '暂停直播首页的推荐直播间.',
  },
  author: {
    name: 'YeJay99',
    link: 'https://github.com/YeJay99',
  },
  entry: async () => {
    const { select } = await import('@/core/spin-query')
    select('video').then((video: HTMLVideoElement) => {
      video.pause()
    })
  },
  urlInclude: [liveHome],
})
