import { computed, onMounted, shallowRef } from 'vue'
import { getUID } from '@/core/utils'
import { useScopedConsole } from '@/core/utils/log'
import { usePagedList } from '../../shared/use-paged-list'
import {
  getDynamicFeedPage,
  getDynamicLiveRooms,
  type DynamicFeedType,
  type DynamicLiveRoom,
} from './dynamic-api'
import type { DynamicEntry } from './dynamic-post'
import { mergeDynamicReposts } from './merge-reposts'
import { useDynamicLike } from './use-dynamic-like'

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

  const { likeStates, toggleLike, resetLikeStates } = useDynamicLike()

  const refresh = () => {
    resetLikeStates()
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
