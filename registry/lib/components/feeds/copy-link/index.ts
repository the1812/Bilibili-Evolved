import { defineComponentMetadata } from '@/components/define'
import { FeedsCard } from '@/components/feeds/api'
import { feedsUrls } from '@/core/utils/urls'

const entry = async () => {
  const { forEachFeedsCard, addMenuItem } = await import('@/components/feeds/api')
  const addCopyLinkButton = (card: FeedsCard) => {
    addMenuItem(card, {
      className: 'copy-link',
      text: '复制链接',
      action: async () => {
        await navigator.clipboard.writeText(`https://t.bilibili.com/${card.id}`)
      },
    })
  }
  forEachFeedsCard({
    added: addCopyLinkButton,
  })
}
export const component = defineComponentMetadata({
  name: 'copyFeedsLink',
  displayName: '复制动态链接',
  entry,
  urlInclude: feedsUrls,
  tags: [componentsTags.feeds, componentsTags.utils],
})
