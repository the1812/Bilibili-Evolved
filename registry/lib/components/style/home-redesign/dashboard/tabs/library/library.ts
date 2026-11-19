import { ref, watch } from 'vue'
import { bilibiliApi, getJsonWithCredentials } from '@/core/ajax'
import { useScopedConsole } from '@/core/utils/log'
import { useAutoLoad } from '../../shared/use-auto-load'

export interface LibraryEntry {
  id: string | number
  title: string
  url?: string
  cover?: string
  detail?: string
  badge?: string
  progress?: number
}

export const getLibraryData = <T>(path: string, params: URLSearchParams, message: string) =>
  bilibiliApi<T>(
    getJsonWithCredentials(`https://api.bilibili.com${path}?${params}`),
    message,
    false,
  )

export const filterLibraryEntries = (entries: LibraryEntry[], keyword: string) => {
  const query = keyword.trim().toLocaleLowerCase()
  return query
    ? entries.filter(item =>
        `${item.title} ${item.detail ?? ''}`.toLocaleLowerCase().includes(query),
      )
    : entries
}

export const libraryProgress = (progress: number, duration: number) => {
  if (progress < 0) {
    return 1
  }
  return duration > 0 && progress > 0 ? Math.min(progress / duration, 1) : undefined
}

export const useLibraryPages = <Cursor>(
  source: () => string | undefined,
  fetchPage: (cursor?: Cursor) => Promise<{ entries: LibraryEntry[]; next?: Cursor }>,
  autoLoad: () => boolean = () => true,
) => {
  const { error: logError } = useScopedConsole('仪表盘首页列表')
  const entries = ref<LibraryEntry[]>([])
  const loading = ref(false)
  const failed = ref(false)
  const hasMore = ref(false)
  let cursor: Cursor | undefined
  let version = 0

  const loadNext = async () => {
    if (!source() || loading.value || !hasMore.value) {
      return
    }
    const request = version
    loading.value = true
    failed.value = false
    try {
      const page = await fetchPage(cursor)
      if (request === version) {
        entries.value = lodash.uniqBy([...entries.value, ...page.entries], item => item.id)
        cursor = page.next
        hasMore.value = cursor !== undefined
      }
    } catch (error) {
      if (request === version) {
        logError(error)
        failed.value = true
      }
    } finally {
      if (request === version) {
        loading.value = false
      }
    }
  }
  const refresh = () => {
    version += 1
    entries.value = []
    cursor = undefined
    loading.value = false
    failed.value = false
    hasMore.value = Boolean(source())
    return loadNext()
  }
  watch(source, refresh, { immediate: true })
  const loadTarget = useAutoLoad(
    () => autoLoad() && hasMore.value && !loading.value && !failed.value,
    loadNext,
  )
  return { entries, loading, failed, hasMore, loadTarget, loadNext, refresh }
}
