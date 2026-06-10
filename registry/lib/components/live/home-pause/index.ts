import { defineComponentMetadata } from '@/components/define'

const liveHome = /^https:\/\/live\.bilibili\.com\/(index\.html)?$/
export const component = defineComponentMetadata({
  name: 'liveHomePause',
  displayName: '直播首页暂停',
  tags: [componentsTags.live],
  description: {
    'zh-CN': '暂停直播首页的推荐直播间.',
  },
  entry: async () => {
    const { isComponentEnabled } = await import('@/core/settings')
    if (!isComponentEnabled('liveHomePause')) {
      return
    }
    const { matchUrlPattern } = await import('@/core/utils')
    if (!matchUrlPattern(liveHome)) {
      return
    }
    const { select } = await import('@/core/spin-query')
    select('video').then((video: HTMLVideoElement) => {
      video.pause()
      console.log('video.pause()')
    })
  },
  urlInclude: [liveHome],
})
