import { ComponentMetadata, componentsTags } from '@/components/component'

export const component: ComponentMetadata = {
  name: 'avUrl',
  displayName: '网址AV号转换',
  description: {
    'zh-CN': '当视频的链接是BV号时, 自动转换为AV号.',
  },
  enabledByDefault: false,
  entry: async () => {
    const { select } = await import('@/core/spin-query')
    const aid = await select(() => unsafeWindow.aid)
    if (!aid) {
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
