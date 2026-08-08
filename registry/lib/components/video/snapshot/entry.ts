import { forEachFeedsCard } from '@/components/feeds/api'
import { ComponentEntry } from '@/components/types'
import { childListSubtree, urlChange } from '@/core/observer'
import { select } from '@/core/spin-query'
import { playerReady } from '@/core/utils'
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

const snapshotButtonSelector = '.view-snapshot-button'

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

function getRecommendCardInfo(card: Element) {
  const item = (
    card as Element & {
      $props?: { item?: { aid?: number; cid?: number; title?: string } }
    }
  ).$props?.item
  if (item?.aid !== undefined && item?.cid !== undefined && item?.title) {
    return {
      vid: item.aid,
      cid: item.cid,
      title: item.title,
    }
  }
  const titleElement = card.querySelector('.title, [title]') as HTMLElement | null
  const title =
    titleElement?.textContent?.trim() || titleElement?.getAttribute('title')?.trim() || ''
  const link = card.querySelector('a[href*="/video/"]') as HTMLAnchorElement | null
  if (!title || !link?.href) {
    return null
  }
  return {
    vid: parseBvidFromUrl(link.href),
    cid: 0,
    title,
  }
}

function addButtonOnRecommendCards(container: Element, position: string) {
  container.querySelectorAll(recommendCardSelector).forEach(card => {
    if (card.querySelector(snapshotButtonSelector)) {
      return
    }
    const info = getRecommendCardInfo(card)
    if (!info) {
      return
    }
    const cover = card.querySelector(recommendCardPicBoxSelector)
    cover.appendChild(createButton(info.vid, info.cid, info.title, position))
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
  if (card.querySelector(snapshotButtonSelector)) {
    return
  }
  const titleAnchor = card.querySelector(spaceVideoCardAnchorSelector) as HTMLAnchorElement | null
  if (!titleAnchor) {
    return
  }
  const vid = parseBvidFromUrl(titleAnchor.href)
  const title = titleAnchor.innerText?.trim()
  const cover = card.querySelector(spaceVideoCardCoverSelector)
  cover.appendChild(createButton(vid, 0, title, position))
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
        let list = currentSpaceListElement
        if (!list || !document.contains(list)) {
          const newList = document.querySelector(spaceVideoListMainSelector)
          if (!newList) {
            return
          }
          list = newList
          bindSpaceListObserver(list, () => {
            processCards()
          })
        }

        list
          .querySelectorAll(spaceVideoCardSelector)
          .forEach(card => addButtonOnSpaceCard(card, positionStr))
      } finally {
        processing = false
      }
    })
  }

  const init = async () => {
    clearSpaceListObserver()
    const list = await select(spaceVideoListMainSelector)
    if (!list) {
      return
    }
    bindSpaceListObserver(list, () => {
      processCards()
    })
    processCards()
  }
  init()
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
      if (videoCard) {
        if (videoCard.querySelector(snapshotButtonSelector)) {
          return
        }
        const button = createButton(
          parseBvidFromUrl(videoCard.href),
          0,
          videoCard.querySelector(feedVideoCardTitleSelector).innerHTML,
          position,
        )
        videoCard.querySelector(feedVideoCardCoverSelector)?.appendChild(button)
      }
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
