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
  if (item?.aid !== null && item?.cid !== null && item?.title) {
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
    if (card.querySelector('.view-snapshot-button')) {
      return
    }
    const info = getRecommendCardInfo(card)
    if (!info) {
      return
    }
    const button = createButton(info.vid, info.cid, info.title, position)
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
  '.top-video, .bili-video-card:not(:has(.bili-cover-card__thumbnail>img[alt="已失效视频"]))'
const spaceVideoCardAnchorSelector = '.top-video__title, .bili-video-card__title>a'
const spaceVideoCardCoverSelector = '.bili-video-card__cover'

// 全局管理空间列表的观察器，避免残留
let spaceListObserver: MutationObserver | null = null
let currentListElement: Element | null = null

function addButtonOnSpaceVideoList(position: ButtonPosition) {
  // 清除之前的 observer
  if (spaceListObserver) {
    spaceListObserver.disconnect()
    spaceListObserver = null
  }
  currentListElement = null

  const positionStr = parseButtonPosition(position)
  let processing = false

  // 扫描当前容器中的所有卡片，为缺少按钮的卡片添加按钮
  const processCards = () => {
    if (processing) {
      return
    }
    processing = true
    requestAnimationFrame(() => {
      try {
        // 检查当前容器是否有效，若无效则重新获取并重新绑定
        let list = currentListElement
        if (!list || !document.contains(list)) {
          // 重新查找容器
          const newList = document.querySelector(spaceVideoListMainSelector)
          if (!newList) {
            return
          }
          // 更新容器和 observer
          list = newList
          currentListElement = list
          if (spaceListObserver) {
            spaceListObserver.disconnect()
            spaceListObserver = null
          }
          const observer = new MutationObserver(() => {
            processCards()
          })
          observer.observe(list, { childList: true, subtree: true })
          spaceListObserver = observer
        }

        // 扫描所有卡片，添加按钮
        const cards = list.querySelectorAll(spaceVideoCardSelector)
        for (const card of cards) {
          // 若已有按钮，则跳过
          if (card.querySelector('.view-snapshot-button')) {
            continue
          }
          const titleAnchor = card.querySelector(spaceVideoCardAnchorSelector) as HTMLAnchorElement
          if (!titleAnchor) {
            continue
          }
          const button = createButton(
            parseBvidFromUrl(titleAnchor.href),
            0,
            titleAnchor.innerText,
            positionStr,
          )
          card.querySelector(spaceVideoCardCoverSelector)?.appendChild(button)
        }
      } finally {
        processing = false
      }
    })
  }

  // 初始建立观察
  const init = async () => {
    const list = await select(spaceVideoListMainSelector)
    if (!list) {
      return
    }
    currentListElement = list
    const observer = new MutationObserver(() => {
      processCards()
    })
    observer.observe(list, { childList: true, subtree: true })
    spaceListObserver = observer
    // 立即执行一次
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
        if (videoCard.querySelector('.view-snapshot-button')) {
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
