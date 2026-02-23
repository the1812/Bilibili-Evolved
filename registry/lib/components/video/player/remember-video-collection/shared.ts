import { subject, firstValueFrom } from '../common/mini-rxjs'

export interface EpisodeRecord {
  lastViewTime: number
  viewCount: number
}

export interface CollectionMap {
  lastBvid: string
  lastPage: number
  title: string
  /** 上次播放视频的下一集 bvid（T+1），用于 resumeNext 功能 */
  nextBvid?: string
  /** 上次播放视频的下一集分P号（T+1），用于 resumeNext 功能 */
  nextPage?: number
}

export interface EpisodeState {
  bvid?: string
  title?: string
  pages?: { p?: number; title?: string }[]
}

export interface RememberInitialState {
  bvid?: string
  p?: number
  sectionsInfo?: {
    id?: string | number
    title?: string
    sections?: {
      episodes?: EpisodeState[]
    }[]
  }
}

export interface RememberOptions {
  [key: string]: unknown
  showPrompt: boolean
  resumeNext: boolean
  history: Record<string, EpisodeRecord>
  seasonMap: Record<string, CollectionMap>
}

// 使用 mini-rxjs 创建状态更新信号
const stateUpdate$ = subject<void>(({ next }) => {
  // 拦截 __INITIAL_STATE__ 的 setter
  const win = unsafeWindow
  const originalDescriptor = Object.getOwnPropertyDescriptor(win, '__INITIAL_STATE__')

  let currentValue = originalDescriptor?.value

  Object.defineProperty(win, '__INITIAL_STATE__', {
    get() {
      return originalDescriptor?.get ? originalDescriptor.get.call(win) : currentValue
    },
    set(newValue: RememberInitialState | undefined) {
      if (originalDescriptor?.set) {
        originalDescriptor.set.call(win, newValue)
      } else {
        currentValue = newValue
      }
      // 触发状态更新信号
      next()
    },
    configurable: true,
    enumerable: true,
  })
})

// 使用 mini-rxjs 创建记忆更新信号
export const memoryUpdate$ = subject<void>()

// 等待 __INITIAL_STATE__ 更新
export const waitForStateUpdate = (timeout = 1000): Promise<void> => {
  return Promise.race([
    firstValueFrom(stateUpdate$),
    new Promise<void>(resolve => setTimeout(resolve, timeout)),
  ])
}

// 触发记忆更新事件
export const emitMemoryUpdate = () => {
  memoryUpdate$.next()
}

export const getRememberState = (): {
  seasonId: string
  seasonTitle: string
  currentBvid: string
  currentP: number
  episodes: EpisodeState[]
} | null => {
  // eslint-disable-next-line no-underscore-dangle
  const state = unsafeWindow.__INITIAL_STATE__ as RememberInitialState | undefined
  const seasonId = state?.sectionsInfo?.id?.toString()
  const currentBvid = state?.bvid
  const episodes = state?.sectionsInfo?.sections?.flatMap(it => it.episodes ?? []) ?? []
  if (!seasonId || !currentBvid || episodes.length === 0) {
    return null
  }
  return {
    seasonId,
    seasonTitle: state?.sectionsInfo?.title ?? '',
    currentBvid,
    currentP: Math.max(1, Number(state?.p ?? 1) || 1),
    episodes,
  }
}

const getEpisodeItem = (podList: HTMLElement, bvid: string) =>
  podList.querySelector(`.pod-item[data-key="${bvid}"]`) as HTMLElement | null

const getTargetPageElement = (episodeItem: HTMLElement, page: number): HTMLElement | null => {
  const pageElements = Array.from(
    episodeItem.querySelectorAll('.page-item.sub, .single-p .simple-base-item'),
  ) as HTMLElement[]
  if (pageElements.length === 0) {
    return episodeItem.querySelector('.head, .single-p .simple-base-item') as HTMLElement | null
  }
  return pageElements[page - 1] ?? pageElements[0]
}

export const jumpToEpisode = async (bvid: string, page: number): Promise<boolean> => {
  const podList = document.querySelector('.video-pod__list') as HTMLElement | null
  if (!podList) {
    return false
  }
  const episodeItem = getEpisodeItem(podList, bvid)
  if (!episodeItem) {
    return false
  }

  if (episodeItem.classList.contains('multi-p')) {
    const expandButton = episodeItem.querySelector('.expand-btn') as HTMLElement | null
    const head = episodeItem.querySelector('.head') as HTMLElement | null
    if (expandButton && !expandButton.classList.contains('expanded') && head) {
      head.click()
      await new Promise(resolve => setTimeout(resolve, 120))
    }
  }

  const target = getTargetPageElement(episodeItem, page)
  target?.click()
  return Boolean(target)
}

// 清除当前合集的记忆
export const clearSeasonMemory = (options: RememberOptions): boolean => {
  const rememberState = getRememberState()
  if (!rememberState) {
    return false
  }
  const { seasonId, episodes } = rememberState

  // 清除该合集所有 BVID 的历史记录
  episodes.forEach(episode => {
    if (!episode.bvid) {
      return
    }
    const pageCount = episode.pages?.length ?? 1
    for (let page = 1; page <= pageCount; page += 1) {
      delete options.history[`${episode.bvid}:${page}`]
    }
  })

  // 清除合集续播记录
  delete options.seasonMap[seasonId]

  // 立即清除 DOM 上的所有标记类
  const podList = document.querySelector('.video-pod__list')
  if (podList) {
    podList
      .querySelectorAll(
        '.remember-dot-history, .pod-item-watched, .remember-page-history, .page-item-watched',
      )
      .forEach(el => {
        el.classList.remove(
          'remember-dot-history',
          'pod-item-watched',
          'remember-page-history',
          'page-item-watched',
        )
      })
  }

  // 触发记忆更新事件
  emitMemoryUpdate()

  return true
}
