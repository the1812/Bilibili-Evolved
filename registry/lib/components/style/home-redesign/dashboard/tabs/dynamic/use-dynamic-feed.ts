import { computed, del, onMounted, reactive, ref, set, shallowRef } from 'vue'
import { getUID } from '@/core/utils'
import { logError, useScopedConsole } from '@/core/utils/log'
import { useAutoLoad } from '../../shared/use-auto-load'
import {
  getDynamicFeedPage,
  getDynamicLiveRooms,
  setDynamicLike,
  type DynamicFeedType,
  type DynamicLiveRoom,
} from './dynamic-api'
import type { DynamicEntry, DynamicLikeState, DynamicPost } from './dynamic-post'
import { mergeDynamicReposts } from './merge-reposts'

export const useDynamicFeed = (type: DynamicFeedType) => {
  const { error: logFeedError } = useScopedConsole('仪表盘首页动态')
  const loggedIn = Boolean(getUID())
  const entries = ref<DynamicEntry[]>([])
  const cards = computed(() => mergeDynamicReposts(entries.value))
  const loading = ref(false)
  const failed = ref(false)
  const hasMore = ref(true)
  let offset: string | undefined

  const liveRooms = shallowRef<DynamicLiveRoom[]>([])
  let loadingLiveRooms = false
  const refreshLiveRooms = async () => {
    if (!loggedIn || type !== 'all' || loadingLiveRooms) {
      return
    }
    loadingLiveRooms = true
    try {
      liveRooms.value = await getDynamicLiveRooms()
    } catch (error) {
      logFeedError(error)
    } finally {
      loadingLiveRooms = false
    }
  }
  onMounted(refreshLiveRooms)

  const likeStates = reactive<Record<string, DynamicLikeState>>({})
  const toggleLike = async ({ id, stats }: DynamicPost) => {
    const like = stats?.like
    if (!like?.canToggle || likeStates[id]?.pending) {
      return
    }
    const current = likeStates[id] ?? { pending: false }
    const liked = (current.liked ?? like.liked) !== true
    set(likeStates, id, { ...current, pending: true })
    try {
      await setDynamicLike(id, liked)
      set(likeStates, id, { liked, pending: false })
    } catch (error) {
      set(likeStates, id, current)
      logError(error instanceof Error ? error : '更新点赞失败')
    }
  }

  const loadNextPage = async () => {
    if (loading.value || !hasMore.value) {
      return
    }
    loading.value = true
    failed.value = false
    try {
      const page = await getDynamicFeedPage(type, offset)
      entries.value = lodash.uniqBy([...entries.value, ...page.entries], entry => entry.id)
      hasMore.value = Boolean(page.nextOffset && page.nextOffset !== offset)
      offset = page.nextOffset
    } catch (error) {
      logFeedError(error)
      failed.value = true
    } finally {
      loading.value = false
    }
  }

  const loadMore = useAutoLoad(() => hasMore.value && !failed.value && !loading.value, loadNextPage)

  const refresh = () => {
    refreshLiveRooms()
    if (loading.value) {
      return
    }
    for (const [id, state] of Object.entries(likeStates)) {
      if (!state.pending) {
        del(likeStates, id)
      }
    }
    entries.value = []
    offset = undefined
    hasMore.value = true
    loadNextPage()
  }

  return {
    loggedIn,
    entries,
    cards,
    liveRooms,
    loading,
    failed,
    hasMore,
    likeStates,
    loadMore,
    loadNextPage,
    toggleLike,
    refresh,
  }
}
