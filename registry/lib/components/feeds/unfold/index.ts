import { defineComponentMetadata } from '@/components/define'
import { select } from '@/core/spin-query'
import { feedsUrlsWithoutDetail } from '@/core/utils/urls'

export const component = defineComponentMetadata({
  name: 'unfoldFeeds',
  displayName: '动态反折叠',
  tags: [componentsTags.feeds],
  urlInclude: feedsUrlsWithoutDetail,
  entry: async () => {
    const { forEachFeedsCard } = await import('@/components/feeds/api')
    forEachFeedsCard({
      added: async card => {
        const foldButton = await select(
          () => dq(card.element, '.fold-hoverable, .bili-dyn-item-fold') as HTMLElement,
        )
        foldButton?.click()
      },
    })
  },
})
