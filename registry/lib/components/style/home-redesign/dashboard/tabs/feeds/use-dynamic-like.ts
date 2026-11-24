import { del, reactive, set } from 'vue'
import { logError } from '@/core/utils/log'
import { setDynamicLike } from './dynamic-api'
import type { DynamicLikeState, DynamicPost } from './dynamic-post'

export const useDynamicLike = () => {
  const likeStates = reactive<Record<string, DynamicLikeState>>({})
  const toggleLike = async ({ id, stats }: Pick<DynamicPost, 'id' | 'stats'>) => {
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

  const resetLikeStates = () => {
    for (const [id, state] of Object.entries(likeStates)) {
      if (!state.pending) {
        del(likeStates, id)
      }
    }
  }

  return { likeStates, toggleLike, resetLikeStates }
}
