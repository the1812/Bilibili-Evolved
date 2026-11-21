import { onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { visible } from '@/core/observer'
import { useScopedConsole } from '@/core/utils/log'

export interface ListPage<Item, Cursor> {
  entries: Item[]
  next?: Cursor
}

export const usePagedList = <Item, Cursor>({
  source,
  fetchPage,
  getKey,
  logName,
  autoLoad = () => true,
}: {
  source: () => string | undefined
  fetchPage: (cursor?: Cursor) => Promise<ListPage<Item, Cursor>>
  getKey: (item: Item) => string | number
  logName: string
  autoLoad?: () => boolean
}) => {
  const { error: logError } = useScopedConsole(logName)
  const entries = shallowRef<Item[]>([])
  const loading = ref(false)
  const failed = ref(false)
  const hasMore = ref(false)
  let cursor: Cursor | undefined
  let generation = 0
  const seenCursors = new Set<Cursor>()

  const loadNext = async () => {
    if (loading.value || !hasMore.value) {
      return
    }
    const request = generation
    loading.value = true
    failed.value = false
    try {
      const page = await fetchPage(cursor)
      if (request === generation) {
        entries.value = lodash.uniqBy([...entries.value, ...page.entries], getKey)
        cursor = page.next
        hasMore.value = cursor !== undefined && !seenCursors.has(cursor)
        if (cursor !== undefined) {
          seenCursors.add(cursor)
        }
      }
    } catch (error) {
      if (request === generation) {
        logError(error)
        failed.value = true
      }
    } finally {
      if (request === generation) {
        loading.value = false
      }
    }
  }

  const refresh = () => {
    generation += 1
    entries.value = []
    cursor = undefined
    seenCursors.clear()
    loading.value = false
    failed.value = false
    hasMore.value = source() !== undefined
    return loadNext()
  }

  watch(source, refresh, { immediate: true, flush: 'sync' })
  onBeforeUnmount(() => {
    generation += 1
  })
  const loadTarget = shallowRef<{ $el: Element }>()
  const canAutoLoad = () => autoLoad() && hasMore.value && !loading.value && !failed.value
  watch(
    () => (canAutoLoad() ? loadTarget.value?.$el : undefined),
    (target, _, onCleanup) => {
      if (!target) {
        return
      }
      const [observer] = visible(target, records => {
        if (
          target === loadTarget.value?.$el &&
          canAutoLoad() &&
          records.some(record => record.isIntersecting)
        ) {
          loadNext()
        }
      })
      onCleanup(() => observer.disconnect())
    },
    { flush: 'post' },
  )
  return { entries, loading, failed, hasMore, loadTarget, loadNext, refresh }
}
