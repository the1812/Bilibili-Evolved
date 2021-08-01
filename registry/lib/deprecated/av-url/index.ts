import { ComponentMetadata } from '@/components/types'

export const component: ComponentMetadata = {
  name: 'avUrl',
  displayName: '网址AV号转换',
  description: {
    'zh-CN': '当视频的链接是BV号时, 自动转换为AV号.',
  },
  entry: async () => {
    const { select } = await import('@/core/spin-query')
    const aid = await select(() => unsafeWindow.aid)
    if (!aid) {
      return
    }
    if (document.URL.includes('videocard_series')) {
      // 系列视频不能转换, 否则会无限刷新
      console.log('skip video series')
      return
    }
    const newUrl = document.URL.replace(/\/(video|bangumi)\/(BV[\w]+)/i, (_, type) => `/${type}/av${aid}`)
    if (document.URL !== newUrl) {
      window.history.replaceState({}, document.title, newUrl)
    }
  },
  tags: [
    componentsTags.video,
    componentsTags.utils,
  ],
  urlInclude: [
    /^https:\/\/www\.bilibili\.com\/video\/BV/i,
  ],
}
