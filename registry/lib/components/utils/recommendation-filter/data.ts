import { isNonnegativeNumber, Recommendation } from './rules'

export interface NativeVideo {
  bvid?: string
  goto?: string
  title?: string
  duration?: number
  pubdate?: number
  is_followed?: number | boolean
  isFollowed?: number | boolean
  stat?: { view?: number }
  stats?: { view?: number }
}

export interface FeedStore {
  data?: {
    recommend?: { item?: NativeVideo[] }
    head?: { recommend?: NativeVideo[] }
  }
  $subscribe?: (callback: () => void, options: { detached: boolean }) => () => void
}

export const getHomeStore = (): FeedStore | undefined => {
  // eslint-disable-next-line no-underscore-dangle
  const provides = (unsafeWindow.document.querySelector('#app') as any)?.__vue_app__?._context
    ?.provides
  for (const key of Reflect.ownKeys(provides || {})) {
    // eslint-disable-next-line no-underscore-dangle
    const store = provides[key]?._s?.get?.('feed') as FeedStore | undefined
    if (store?.data) {
      return store
    }
  }
  return undefined
}

export const readHomeVideos = (store: FeedStore): NativeVideo[] => [
  ...(store.data?.head?.recommend || []),
  ...(store.data?.recommend?.item || []),
]

export const toRecommendation = (raw: NativeVideo): Recommendation | undefined => {
  if (!raw.bvid || (raw.goto && raw.goto !== 'av')) {
    return undefined
  }
  const followValue = raw.is_followed ?? raw.isFollowed
  const views = raw.stat?.view ?? raw.stats?.view
  let followed: boolean | undefined
  if (followValue === 1 || followValue === true) {
    followed = true
  } else if (followValue === 0 || followValue === false) {
    followed = false
  }
  return {
    bvid: raw.bvid,
    title: typeof raw.title === 'string' ? raw.title : undefined,
    duration: isNonnegativeNumber(raw.duration) ? raw.duration : undefined,
    views: isNonnegativeNumber(views) ? views : undefined,
    followed,
    publishedAt: isNonnegativeNumber(raw.pubdate) ? raw.pubdate : undefined,
  }
}

export const bvidFromUrl = (href: string) => {
  try {
    const url = new URL(href, document.URL)
    return url.hostname === 'www.bilibili.com'
      ? url.pathname.match(/^\/video\/(BV[\da-z]+)/i)?.[1]
      : undefined
  } catch {
    return undefined
  }
}

export const readCardVideo = (card: Element): NativeVideo | undefined => {
  // Vue 2's card item stays current after in-page navigation and node reuse.
  // eslint-disable-next-line no-underscore-dangle
  const vm = (card as any).__vue__
  return vm?.item ?? vm?.$props?.item
}

export const readInitialRelated = (): NativeVideo[] => {
  // Only use initial state while it still belongs to the current video.
  // eslint-disable-next-line no-underscore-dangle
  const state = (unsafeWindow as any).__INITIAL_STATE__
  return state?.bvid === bvidFromUrl(document.URL) && Array.isArray(state?.related)
    ? state.related
    : []
}
