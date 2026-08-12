import { forEachFeedsCard } from '@/components/feeds/api'
import { ComponentEntry } from '@/components/types'
import { childListSubtree, urlChange } from '@/core/observer'
import { select } from '@/core/spin-query'
import { getVue2Data, playerReady } from '@/core/utils'
import {
  feedsUrls,
  matchCurrentPage,
  spaceFavoriteListUrls,
  spaceUploadVideosUrls,
  videoUrls,
} from '@/core/utils/urls'
import ViewButton from './ViewButton.vue'
import { getConsole, getOptions } from './handler'
import { ButtonPosition, isButtonEnabled, parseButtonPosition } from './options'

function hasSnapshotButton(card: Element) {
  return card.querySelector('.view-snapshot-button') !== null
}

function createButton(vid: number | string, cid: number, title: string, position: string) {
  const vm = new (Vue.extend(ViewButton))({
    propsData: {
      vid,
      cid,
      title,
      position,
    },
  })
  vm.$mount()
  return vm.$el
}

function parseBvidFromUrl(url: string) {
  return url.match(/bilibili\.com\/video\/(\w+)/i)?.[1] ?? ''
}

// ========================================================================== //

const recommendListContainerSelector = '.recommend-list-v1, .recommend-list-container'
const recommendCardSelector = '.video-page-card-small, .recommend-video-card.video-card'
const recommendCardPicBoxSelector = '.card-box>.pic-box'

function addButtonOnRecommendCards(container: Element, position: string) {
  container.querySelectorAll(recommendCardSelector).forEach(card => {
    if (hasSnapshotButton(card)) {
      return
    }
    const data = (
      getVue2Data(card) as {
        $props: {
          item?: { aid: number; cid: number; title: string }
          info?: { aid: number; cid: number; title: string }
        }
      }
    ).$props
    const item = data.item ?? data.info
    if (!item) {
      return
    }
    const button = createButton(item.aid, item.cid, item.title, position)
    card.querySelector(recommendCardPicBoxSelector)?.appendChild(button)
  })
}

async function addButtonOnRecommendList() {
  const position = parseButtonPosition(getOptions().recommendListButton)
  const container = await select(recommendListContainerSelector)
  if (!container) {
    getConsole().warn('未找到推荐列表容器')
    return
  }
  const addCards = () => addButtonOnRecommendCards(container, position)
  addCards()
  childListSubtree(container, () => {
    requestAnimationFrame(addCards)
  })
}

// ========================================================================== //

const spaceVideoListMainSelector =
  '.fav-list-main>.items, .space-upload .video-list, .space-home .content, .space-lists .lists-content, .space-list-details .list-content'
const spaceVideoCardSelector =
  '.top-video, .upload-video-card.list-mode, .bili-video-card:not(:has(.bili-cover-card__thumbnail>img[alt="已失效视频"])):not(:has(.bili-cover-card__tags .pugv-tag))'
const spaceVideoCardAnchorSelector =
  '.top-video__title, .info__top>.title, .bili-video-card__title>a'
const spaceVideoCardCoverSelector = '.bili-video-card__cover'

let spaceListObserver: MutationObserver | null = null
let currentSpaceListElement: Element | null = null

function clearSpaceListObserver() {
  spaceListObserver?.disconnect()
  spaceListObserver = null
  currentSpaceListElement = null
}

function bindSpaceListObserver(list: Element, callback: () => void) {
  clearSpaceListObserver()
  currentSpaceListElement = list
  spaceListObserver = new MutationObserver(callback)
  spaceListObserver.observe(list, { childList: true, subtree: true })
}

function addButtonOnSpaceCard(card: Element, position: string) {
  if (hasSnapshotButton(card)) {
    return
  }
  const titleAnchor = card.querySelector(spaceVideoCardAnchorSelector) as HTMLAnchorElement
  const button = createButton(
    parseBvidFromUrl(titleAnchor.href),
    0,
    titleAnchor.innerText,
    position,
  )
  card.querySelector(spaceVideoCardCoverSelector)?.appendChild(button)
}

function addButtonOnSpaceVideoList(position: ButtonPosition) {
  const positionStr = parseButtonPosition(position)
  let processing = false
  const processCards = () => {
    if (processing) {
      return
    }
    processing = true
    requestAnimationFrame(() => {
      try {
        const list = currentSpaceListElement ?? document.querySelector(spaceVideoListMainSelector)
        if (!list) {
          return
        }
        if (list !== currentSpaceListElement) {
          bindSpaceListObserver(list, processCards)
        }
        list
          .querySelectorAll(spaceVideoCardSelector)
          .forEach(card => addButtonOnSpaceCard(card, positionStr))
      } finally {
        processing = false
      }
    })
  }
  clearSpaceListObserver()
  select(spaceVideoListMainSelector).then(list => {
    if (!list) {
      return
    }
    bindSpaceListObserver(list, processCards)
    processCards()
  })
}

// ========================================================================== //

const feedVideoCardSelector = 'a.bili-dyn-card-video'
const feedVideoCardTitleSelector = '.bili-dyn-card-video__title'
const feedVideoCardCoverSelector = '.bili-dyn-card-video__cover'

function addButtonOnFeedCards() {
  const position = parseButtonPosition(getOptions().feedCardButton)
  forEachFeedsCard({
    added: card => {
      const videoCard: HTMLAnchorElement = card.element.querySelector(feedVideoCardSelector)
      if (!videoCard || hasSnapshotButton(videoCard)) {
        return
      }
      const button = createButton(
        parseBvidFromUrl(videoCard.href),
        0,
        videoCard.querySelector(feedVideoCardTitleSelector).innerHTML,
        position,
      )
      videoCard.querySelector(feedVideoCardCoverSelector)?.appendChild(button)
    },
  })
}

// ========================================================================== //

export const entry: ComponentEntry = async () => {
  const options = getOptions()
  urlChange(() => {
    clearSpaceListObserver()
    if (matchCurrentPage(videoUrls) && isButtonEnabled(options.recommendListButton)) {
      playerReady().then(addButtonOnRecommendList)
    } else if (
      matchCurrentPage(spaceFavoriteListUrls) &&
      isButtonEnabled(options.favoriteListButton)
    ) {
      addButtonOnSpaceVideoList(options.favoriteListButton)
    } else if (
      matchCurrentPage([
        ...spaceUploadVideosUrls,
        /^https:\/\/space\.bilibili\.com\/\d+\/?$/,
        /^https:\/\/space\.bilibili\.com\/[\d]+\/list/,
      ]) &&
      isButtonEnabled(options.uploadListButton)
    ) {
      addButtonOnSpaceVideoList(options.uploadListButton)
    } else if (matchCurrentPage(feedsUrls) && isButtonEnabled(options.feedCardButton)) {
      addButtonOnFeedCards()
    }
  })
}
