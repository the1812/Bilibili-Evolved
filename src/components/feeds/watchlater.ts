import { set, watch } from 'vue'
import { getUID, getVue2Data } from '@/core/utils'
import { logError } from '@/core/utils/log'
import {
  getWatchlaterStatus,
  onWatchlaterHover,
  toggleWatchlater,
  watchlaterStatuses,
} from '@/components/video/watchlater'
import { forEachFeedsCard } from './api'

interface NativeVideoCard {
  data: { aid: string | number; title: string }
  mark: { done: boolean; loading: boolean; tip: string }
  $once: (event: string, callback: () => void) => void
}

/** 原生按钮默认未添加，悬停或点击时查询真实状态。 */
export const initFeedsWatchlater = async () => {
  if (!getUID()) {
    return
  }
  const cleanups = new WeakMap<Element, () => void>()
  await forEachFeedsCard({
    added: ({ element }) => {
      element.querySelectorAll('.bili-dyn-card-video').forEach(target => {
        if (cleanups.has(target)) {
          return
        }
        const instance = getVue2Data(target)
        const native = (
          instance?.$options.name === 'bili-dyn-card-video'
            ? instance
            : instance?.$children?.find(child => child.$options.name === 'bili-dyn-card-video')
        ) as NativeVideoCard | undefined
        if (!native?.data?.aid || !native.mark) {
          return
        }
        const aid = Number(native.data.aid)
        let clicking = false
        let stopStatus: (() => void) | undefined
        const sync = (added: boolean | undefined) => {
          if (added !== undefined && target.isConnected) {
            native.mark.done = added
          }
        }
        sync(watchlaterStatuses[aid])
        native.mark.tip = watchlaterStatuses[aid] === undefined ? '查询稍后再看状态' : ''
        const loadStatus = async (signal?: AbortSignal) => {
          if (!stopStatus) {
            // Vue 2 需要先创建响应式键，再监听首次查询后的变化。
            if (!(aid in watchlaterStatuses)) {
              set(watchlaterStatuses, aid, undefined)
            }
            stopStatus = watch(() => watchlaterStatuses[aid], sync, { immediate: true })
          }
          native.mark.tip = '查询中...'
          try {
            const added = await getWatchlaterStatus(aid, native.data.title, signal)
            sync(added)
            native.mark.tip = added ? '移除' : '稍后再看'
            return added
          } catch (error) {
            native.mark.tip = signal?.aborted ? '查询稍后再看状态' : '查询失败，请重试'
            throw error
          }
        }
        const stopHover = onWatchlaterHover(target, loadStatus)
        const click = async (event: MouseEvent) => {
          if (!(event.target as Element).closest('.bili-dyn-card-video__mark')) {
            return
          }
          // 不让原生按钮以默认的 false 状态直接添加，或在请求完成后再次翻转状态。
          event.preventDefault()
          event.stopImmediatePropagation()
          if (clicking) {
            return
          }
          clicking = true
          native.mark.loading = true
          try {
            const added = await loadStatus()
            if (await toggleWatchlater(aid, !added)) {
              sync(watchlaterStatuses[aid])
              native.mark.tip = added ? '已移除' : '已加稍后再看'
            } else {
              native.mark.tip = '操作失败，请重试'
            }
          } catch (error) {
            logError(error)
          } finally {
            clicking = false
            native.mark.loading = false
          }
        }
        target.addEventListener('click', click, true)
        const cleanup = () => {
          stopHover()
          stopStatus?.()
          target.removeEventListener('click', click, true)
          cleanups.delete(target)
        }
        cleanups.set(target, cleanup)
        native.$once('hook:beforeDestroy', cleanup)
      })
    },
    removed: ({ element }) => {
      element.querySelectorAll('.bili-dyn-card-video').forEach(card => cleanups.get(card)?.())
    },
  })
}
