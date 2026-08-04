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
import { getConsole, getOptions, clearSnapshotCanvasCache } from './handler'
import { ButtonPosition, isButtonEnabled, parseButtonPosition } from './options'
import { addComponentListener } from '@/core/settings'

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

function updateButtonPosition(button: HTMLElement, position: ButtonPosition) {
  button.classList.remove('top', 'bottom', 'left', 'right')
  const [vertical, horizontal] = parseButtonPosition(position).split(' ')
  if (vertical) {
    button.classList.add(vertical)
  }
  if (horizontal) {
    button.classList.add(horizontal)
  }
}

function combineSelectors(prefix: string, suffix: string) {
  return prefix
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .map(item => `${item} ${suffix}`)
    .join(', ')
}

function updateButtonsPositionWithin(selector: string, position: ButtonPosition) {
  document.querySelectorAll<HTMLElement>(selector).forEach(button => {
    updateButtonPosition(button, position)
  })
}

function syncButtonPositions(selector: string, position: ButtonPosition, onEmpty?: () => void) {
  const buttons = document.querySelectorAll<HTMLElement>(selector)
  if (!isButtonEnabled(position)) {
    buttons.forEach(button => button.remove())
    return
  }
  if (buttons.length === 0) {
    onEmpty?.()
    return
  }
  updateButtonsPositionWithin(selector, position)
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
  if (item?.aid != null && item?.cid != null && item?.title) {
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
  return title && link?.href
    ? {
        vid: parseBvidFromUrl(link.href),
        cid: 0,
        title,
      }
    : null
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
  const container = await select(recommendListContainerSelector)
  if (!container) {
    getConsole().warn('未找到推荐列表容器')
    return
  }
  const addCards = () => {
    const currentOption = getOptions().recommendListButton
    if (!isButtonEnabled(currentOption)) {
      return
    }
    addButtonOnRecommendCards(container, parseButtonPosition(currentOption))
  }
  addCards()
  childListSubtree(container, () => {
    requestAnimationFrame(addCards)
  })
}

// ========================================================================== //

const spaceVideoListMainSelector =
  '.fav-list-main>.items, .space-upload .video-list, .space-home .content, .space-lists .lists-content, .space-list-details .list-content'
const spaceVideoCardSelector =
  '.top-video, .upload-video-card.list-mode, .bili-video-card:not(:has(.bili-cover-card__thumbnail>img[alt="已失效视频"]))'
const spaceVideoCardAnchorSelector =
  '.top-video__title, .info__top>.title, .bili-video-card__title>a'
const spaceVideoCardCoverSelector = '.bili-video-card__cover'

// 全局管理空间列表的观察器，避免残留
let spaceListObserver: MutationObserver | null = null
let currentListElement: Element | null = null

function bindSpaceListObserver(list: Element, processCards: () => void) {
  if (spaceListObserver) {
    spaceListObserver.disconnect()
  }
  currentListElement = list
  spaceListObserver = new MutationObserver(() => {
    processCards()
  })
  spaceListObserver.observe(list, { childList: true, subtree: true })
}

function addButtonOnSpaceVideoList(getPosition: () => ButtonPosition) {
  if (spaceListObserver) {
    spaceListObserver.disconnect()
    spaceListObserver = null
  }
  currentListElement = null

  let processing = false

  const processCards = () => {
    if (processing) {
      return
    }
    processing = true
    requestAnimationFrame(() => {
      try {
        let list = currentListElement
        if (!list || !document.contains(list)) {
          list = document.querySelector(spaceVideoListMainSelector)
          if (!list) {
            return
          }
          bindSpaceListObserver(list, processCards)
        }

        const currentOption = getPosition()
        if (!isButtonEnabled(currentOption)) {
          list
            .querySelectorAll(`${spaceVideoCardCoverSelector} .view-snapshot-button`)
            .forEach(button => button.remove())
          return
        }

        const positionStr = parseButtonPosition(currentOption)
        list.querySelectorAll(spaceVideoCardSelector).forEach(card => {
          if (card.querySelector('.view-snapshot-button')) {
            return
          }
          const titleAnchor = card.querySelector(
            spaceVideoCardAnchorSelector,
          ) as HTMLAnchorElement | null
          if (!titleAnchor) {
            return
          }
          const button = createButton(
            parseBvidFromUrl(titleAnchor.href),
            0,
            titleAnchor.textContent?.trim() || '',
            positionStr,
          )
          card.querySelector(spaceVideoCardCoverSelector)?.appendChild(button)
        })
      } finally {
        processing = false
      }
    })
  }

  const init = async () => {
    const list = await select(spaceVideoListMainSelector)
    if (!list) {
      return
    }
    bindSpaceListObserver(list, processCards)
    processCards()
  }
  init()
}

// ========================================================================== //

const feedVideoCardSelector = 'a.bili-dyn-card-video'
const feedVideoCardTitleSelector = '.bili-dyn-card-video__title'
const feedVideoCardCoverSelector = '.bili-dyn-card-video__cover'

function addButtonOnFeedCards() {
  forEachFeedsCard({
    added: card => {
      const currentOption = getOptions().feedCardButton
      if (!isButtonEnabled(currentOption)) {
        return
      }
      const position = parseButtonPosition(currentOption)
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

const snapshotCacheInvalidationOptions = [
  'gridRows',
  'gridColumns',
  'gridGap',
  'gridBorder',
  'gridBackgroundColor',
  'textColor',
  'textSize',
  'textFont',
  'enlargeSmallImage',
  'showInfoHeader',
] as const

let snapshotCacheListenersRegistered = false

export const entry: ComponentEntry = async () => {
  if (!snapshotCacheListenersRegistered) {
    snapshotCacheListenersRegistered = true
    snapshotCacheInvalidationOptions.forEach(optionName => {
      addComponentListener(`videoSnapshot.${optionName}`, clearSnapshotCanvasCache)
    })
  }

  const updateRecommendButtons = (position: ButtonPosition) => {
    const selector = combineSelectors(
      recommendListContainerSelector,
      `${recommendCardPicBoxSelector} .view-snapshot-button`,
    )
    syncButtonPositions(selector, position, () => {
      if (matchCurrentPage(videoUrls)) {
        playerReady().then(addButtonOnRecommendList)
      }
    })
  }

  const updateSpaceButtons = (position: ButtonPosition, createList: () => void) => {
    const selector = combineSelectors(
      spaceVideoListMainSelector,
      `${spaceVideoCardCoverSelector} .view-snapshot-button`,
    )
    syncButtonPositions(selector, position, createList)
  }

  const updateUploadButtons = (position: ButtonPosition) => {
    updateSpaceButtons(position, () =>
      addButtonOnSpaceVideoList(() => getOptions().uploadListButton),
    )
  }

  const updateFavoriteButtons = (position: ButtonPosition) => {
    updateSpaceButtons(position, () =>
      addButtonOnSpaceVideoList(() => getOptions().favoriteListButton),
    )
  }

  const updateFeedButtons = (position: ButtonPosition) => {
    const selector = `${feedVideoCardCoverSelector} .view-snapshot-button`
    syncButtonPositions(selector, position, () => {
      if (matchCurrentPage(feedsUrls)) {
        addButtonOnFeedCards()
      }
    })
  }

  addComponentListener('videoSnapshot.recommendListButton', updateRecommendButtons)
  addComponentListener('videoSnapshot.uploadListButton', updateUploadButtons)
  addComponentListener('videoSnapshot.favoriteListButton', updateFavoriteButtons)
  addComponentListener('videoSnapshot.feedCardButton', updateFeedButtons)

  urlChange(() => {
    const currentOptions = getOptions()
    if (matchCurrentPage(videoUrls) && isButtonEnabled(currentOptions.recommendListButton)) {
      playerReady().then(addButtonOnRecommendList)
    } else if (
      matchCurrentPage(spaceFavoriteListUrls) &&
      isButtonEnabled(currentOptions.favoriteListButton)
    ) {
      addButtonOnSpaceVideoList(() => currentOptions.favoriteListButton)
    } else if (
      matchCurrentPage([
        ...spaceUploadVideosUrls,
        /^https:\/\/space\.bilibili\.com\/\d+\/?$/,
        /^https:\/\/space\.bilibili\.com\/[\d]+\/list/,
      ]) &&
      isButtonEnabled(currentOptions.uploadListButton)
    ) {
      addButtonOnSpaceVideoList(() => currentOptions.uploadListButton)
    } else if (matchCurrentPage(feedsUrls) && isButtonEnabled(currentOptions.feedCardButton)) {
      addButtonOnFeedCards()
    }
  })
}
