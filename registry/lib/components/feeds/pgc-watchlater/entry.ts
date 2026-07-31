import { forEachFeedsCard } from '@/components/feeds/api'
import { ComponentEntry } from '@/components/types'
import { urlChange } from '@/core/observer'
import { getUID } from '@/core/utils'
import { feedsUrls, matchCurrentPage } from '@/core/utils/urls'
import WatchlaterButton from './WatchlaterButton.vue'

function createButton() {
  const vm = new (Vue.extend(WatchlaterButton))()
  vm.$mount()
  return vm.$el
}

const feedPgcCardSelector = 'a.bili-dyn-card-pgc'
const feedPgcCardCoverSelector = '.bili-dyn-card-pgc__cover'

function addButtonOnFeedCards() {
  forEachFeedsCard({
    added: card => {
      const videoCard: HTMLAnchorElement = card.element.querySelector(feedPgcCardSelector)
      if (videoCard) {
        if (videoCard.querySelector('.bili-dyn-card-pgc__mark')) {
          return
        }
        const button = createButton()
        videoCard.querySelector(feedPgcCardCoverSelector)?.appendChild(button)
      }
    },
  })
}

export const entry: ComponentEntry = async () => {
  urlChange(() => {
    if (!getUID()) {
      return
    }
    if (matchCurrentPage(feedsUrls)) {
      addButtonOnFeedCards()
    }
  })
}
