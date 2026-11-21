import type { ContentCardData } from '../../shared/cards/content-card'

export interface LibraryEntry extends ContentCardData {
  id: string | number
  date?: Date
}

export const isMarkedWatched = (progress?: number) => progress === -1

export const getPlaybackProgress = (watchedSeconds?: number, duration?: number) => {
  if (isMarkedWatched(watchedSeconds)) {
    return 1
  }
  if (
    Number.isFinite(watchedSeconds) &&
    watchedSeconds > 0 &&
    Number.isFinite(duration) &&
    duration > 0
  ) {
    return Math.min(watchedSeconds / duration, 1)
  }
  return undefined
}

export const filterLibraryEntries = (entries: LibraryEntry[], keyword: string) => {
  const query = keyword.trim().toLocaleLowerCase()
  return query
    ? entries.filter(({ title, upName }) =>
        [title, upName].some(value => value?.toLocaleLowerCase().includes(query)),
      )
    : entries
}

export const getLibraryEmptyMessage = ({
  entries,
  matches,
  filtering,
  hasMore = false,
  empty,
}: {
  entries: readonly unknown[]
  matches: LibraryEntry[]
  filtering: boolean
  hasMore?: boolean
  empty: string
}) => {
  if (matches.length) {
    return ''
  }
  if (filtering && (entries.length || hasMore)) {
    return hasMore ? '已加载的内容中没有匹配项' : '没有符合条件的内容'
  }
  return hasMore ? '' : empty
}
