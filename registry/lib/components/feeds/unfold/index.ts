import { feedsUrlsWithoutDetail } from '@/core/utils/urls'
import { defineComponentMetadata } from '@/components/define'

export const component = defineComponentMetadata({
  name: 'unfoldFeeds',
  displayName: '动态反折叠',
  tags: [componentsTags.feeds],
  description: {
    'zh-CN': `
自动展开被折叠的动态.

动态被折叠可能是因为:
- 短时间内大量更新作品
- 多人转发同一个作品
- 被审核折叠
`,
  },
  urlInclude: feedsUrlsWithoutDetail,
  entry: async () => {
    const { forEachFeedsCard } = await import('@/components/feeds/api')
    forEachFeedsCard({
      added: card => {
        const foldButton = dq(card.element, '.fold-hoverable') as HTMLElement
        foldButton?.click()
      },
    })
  },
})
