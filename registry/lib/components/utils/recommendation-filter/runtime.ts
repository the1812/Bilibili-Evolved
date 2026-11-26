/* eslint-disable @typescript-eslint/no-use-before-define */
import { mutationObserve, urlChange } from '@/core/observer'
import {
  addComponentListener,
  getComponentSettings,
  removeComponentListener,
} from '@/core/settings'
import {
  bvidFromUrl,
  FeedStore,
  getHomeStore,
  readCardVideo,
  readHomeVideos,
  readInitialRelated,
  toRecommendation,
} from './data'
import { componentName, options as optionMetadata } from './options'
import { disposeManager } from './manager'
import { activateCardMenu, deactivateCardMenu, updateCardMenus } from './card-menu'
import { FilterOptions, matchRecommendation, parseDuration, Recommendation } from './rules'
import { prepareKeywordGroups } from './groups'

export const uiState = Vue.observable({ matched: 0, scanned: 0, showFiltered: false })
const activeClass = 'be-recommendation-filter-active'
const showClass = 'be-recommendation-filter-show'
const reasonAttribute = 'data-be-recommendation-filter'
const homeScope = '.recommended-container_floor-aside, .feed2'
const relatedScope = [
  '#recom_module',
  '#reco_list',
  '.r-con .rcmd-list',
  '.playlist-container .recommend-list-container',
  '.plp-r [class*="recommend_wrap"]',
  '.video-container-v1 .recommend-list-v1',
].join(', ')
const relatedCard =
  '.video-page-card-small, .video-page-card, .recommend-video-card, .remd-video-card'
const allScopes = `${homeScope}, ${relatedScope}`
const homeIndex = new Map<string, Recommendation>()
const marked = new Set<HTMLElement>()
let active = false
let lastUrl = ''
let frame: number | undefined
let timer: number | undefined
let retry: number | undefined
let observer: MutationObserver | undefined
let urlAbort: AbortController | undefined
let feedStore: FeedStore | undefined
let unsubscribe: (() => void) | undefined

export const getOptions = () =>
  getComponentSettings<FilterOptions & Record<string, unknown>>(componentName).options

const restoreCard = (card: HTMLElement) => {
  card.removeAttribute(reasonAttribute)
  marked.delete(card)
}
const resetCards = () => {
  marked.forEach(restoreCard)
  uiState.matched = 0
  uiState.scanned = 0
}

const readHomeIndex = () => {
  const nextStore = getHomeStore()
  if (nextStore !== feedStore) {
    unsubscribe?.()
    feedStore = nextStore
    unsubscribe = feedStore?.$subscribe?.(scheduleScan, { detached: true })
  }
  if (!feedStore) {
    if (retry === undefined) {
      retry = window.setTimeout(() => {
        retry = undefined
        scheduleScan()
      }, 500)
    }
    return
  }
  readHomeVideos(feedStore).forEach(raw => {
    const video = toRecommendation(raw)
    if (video) {
      homeIndex.set(video.bvid, video)
    }
  })
}
const cardBvid = (card: Element) =>
  [...card.querySelectorAll<HTMLAnchorElement>('a[href]')]
    .map(link => bvidFromUrl(link.href))
    .find(Boolean)

const scan = () => {
  frame = undefined
  if (!active) {
    return
  }
  if (lastUrl !== document.URL) {
    lastUrl = document.URL
    resetCards()
    homeIndex.clear()
    unsubscribe?.()
    unsubscribe = undefined
    feedStore = undefined
  }
  const home = /^\/(?:index\.html)?$/.test(location.pathname)
  const videoPage = /^\/video\/(?:BV[\da-z]+|av\d+)/i.test(location.pathname)
  const seen = new Set<HTMLElement>()
  const currentOptions = getOptions()
  const now = Date.now()
  const evaluate = (card: HTMLElement, raw: Recommendation | undefined, bvid: string) => {
    seen.add(card)
    const title = card.querySelector<HTMLElement>('.bili-video-card__info--tit, .title')
    const duration = card.querySelector<HTMLElement>('.bili-video-card__stats__duration, .duration')
    const data: Recommendation = {
      ...raw,
      bvid,
      title: raw?.title ?? title?.getAttribute('title') ?? title?.textContent ?? undefined,
      duration: raw?.duration ?? parseDuration(duration?.textContent || ''),
    }
    const reasons = matchRecommendation(data, currentOptions, home, now)
    if (reasons.length) {
      const text = reasons.join('；')
      if (card.getAttribute(reasonAttribute) !== text) {
        card.setAttribute(reasonAttribute, text)
      }
      marked.add(card)
    } else if (marked.has(card)) {
      restoreCard(card)
    }
  }
  if (home) {
    readHomeIndex()
    document.querySelectorAll(homeScope).forEach(scope => {
      scope.querySelectorAll<HTMLElement>('.bili-video-card').forEach(card => {
        const bvid = cardBvid(card)
        if (!bvid) {
          return
        }
        const layout = card.closest<HTMLElement>('.feed-card')
        // Hide the grid item as well, otherwise an empty slot remains on V8.
        const target =
          layout && layout.querySelectorAll('.bili-video-card').length === 1 ? layout : card
        evaluate(target, homeIndex.get(bvid), bvid)
      })
    })
  } else if (videoPage) {
    const initial = new Map(
      readInitialRelated().map(raw => [raw.bvid, toRecommendation(raw)] as const),
    )
    document.querySelectorAll(relatedScope).forEach(scope => {
      scope.querySelectorAll<HTMLElement>(relatedCard).forEach(card => {
        const bvid = cardBvid(card)
        if (!bvid) {
          return
        }
        const native = readCardVideo(card)
        const data = native?.bvid === bvid ? toRecommendation(native) : initial.get(bvid)
        evaluate(card, data, bvid)
      })
    })
  }
  marked.forEach(card => {
    if (!seen.has(card)) {
      restoreCard(card)
    }
  })
  // Discard removed batches instead of retaining an endless feed.
  if (home) {
    const mounted = new Set([...seen].map(cardBvid).filter(Boolean))
    homeIndex.forEach((_, bvid) => {
      if (!mounted.has(bvid)) {
        homeIndex.delete(bvid)
      }
    })
  }
  uiState.scanned = seen.size
  uiState.matched = marked.size
}

function scheduleScan() {
  if (active && frame === undefined) {
    frame = window.setTimeout(scan, 50)
  }
}
export const setShowFiltered = (show: boolean) => {
  uiState.showFiltered = show
  document.documentElement.classList.toggle(showClass, active && show)
}
export const deactivate = () => {
  active = false
  deactivateCardMenu()
  disposeManager()
  observer?.disconnect()
  observer = undefined
  urlAbort?.abort()
  urlAbort = undefined
  unsubscribe?.()
  unsubscribe = undefined
  feedStore = undefined
  if (frame !== undefined) {
    clearTimeout(frame)
  }
  clearInterval(timer)
  clearTimeout(retry)
  frame = undefined
  timer = undefined
  retry = undefined
  Object.keys(optionMetadata).forEach(key =>
    removeComponentListener(`${componentName}.${key}`, scheduleScan),
  )
  resetCards()
  homeIndex.clear()
  uiState.showFiltered = false
  document.documentElement.classList.remove(activeClass, showClass)
}
export const activate = () => {
  if (active) {
    return
  }
  const currentOptions = getOptions()
  const groups = prepareKeywordGroups(currentOptions.keywordGroups)
  if (groups !== currentOptions.keywordGroups) {
    currentOptions.keywordGroups = groups
  }
  active = true
  activateCardMenu()
  lastUrl = ''
  document.documentElement.classList.add(activeClass)
  Object.keys(optionMetadata).forEach(key =>
    addComponentListener(`${componentName}.${key}`, scheduleScan),
  )
  urlAbort = new AbortController()
  urlChange(scheduleScan, { signal: urlAbort.signal })
  ;[observer] = mutationObserve(
    [document.documentElement],
    {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['href', 'title'],
    },
    records => {
      updateCardMenus(records)
      const relevant = records.some(record => {
        const element =
          record.target instanceof Element ? record.target : record.target.parentElement
        return (
          element?.closest(allScopes) ||
          [...record.addedNodes].some(
            node =>
              node instanceof Element && (node.matches(allScopes) || node.querySelector(allScopes)),
          )
        )
      })
      if (relevant || document.URL !== lastUrl) {
        scheduleScan()
      }
    },
  )
  timer = window.setInterval(scheduleScan, 60000)
  scheduleScan()
}
