import { defineComponentMetadata } from '@/components/define'
import { feedsUrls } from '@/core/utils/urls'
import { forEachFeedsCard } from '@/components/feeds/api'
import { urlChange } from '@/core/observer'
import { getUID } from '@/core/utils'
import WatchlaterButton from './WatchlaterButton.vue'

const feedPgcCardSelector = 'a.bili-dyn-card-pgc'
const feedPgcCardCoverSelector = '.bili-dyn-card-pgc__cover'

const entry = async () => {
  urlChange(() => {
    if (!getUID()) {
      return
    }
    forEachFeedsCard({
      added: card => {
        const videoCard: HTMLAnchorElement = card.element.querySelector(feedPgcCardSelector)
        if (videoCard) {
          if (videoCard.querySelector('.bili-dyn-card-pgc__mark')) {
            return
          }
          const vm = new (Vue.extend(WatchlaterButton))()
          vm.$mount()
          const button = vm.$el
          videoCard.querySelector(feedPgcCardCoverSelector)?.appendChild(button)
        }
      },
    })
  })
}

export const component = defineComponentMetadata({
  name: 'pgcWatchlater',
  displayName: '番剧动态稍后再看按钮',
  author: {
    name: 'WhiteTeal55',
    link: 'https://github.com/WhiteTeal55',
  },
  tags: [componentsTags.feeds, componentsTags.utils],
  entry,
  urlInclude: feedsUrls,
})
