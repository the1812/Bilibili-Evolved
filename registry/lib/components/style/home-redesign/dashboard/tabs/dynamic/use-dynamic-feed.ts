import { computed, del, onMounted, reactive, set, shallowRef } from 'vue'
import { getUID } from '@/core/utils'
import { logError, useScopedConsole } from '@/core/utils/log'
import { usePagedList } from '../../shared/use-paged-list'
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
  const {
    entries,
    loading,
    failed,
    hasMore,
    loadTarget,
    loadNext,
    refresh: refreshPosts,
  } = usePagedList<DynamicEntry, string>({
    source: () => (loggedIn ? type : undefined),
    fetchPage: offset => getDynamicFeedPage(type, offset),
    getKey: entry => entry.id,
    logName: '仪表盘首页动态',
  })
  const cards = computed(() => mergeDynamicReposts(entries.value))

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

  const refresh = () => {
    for (const [id, state] of Object.entries(likeStates)) {
      if (!state.pending) {
        del(likeStates, id)
      }
    }
    refreshLiveRooms()
    return refreshPosts()
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
    loadTarget,
    loadNext,
    toggleLike,
    refresh,
  }
}
