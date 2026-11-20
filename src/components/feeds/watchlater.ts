import { set, watch } from 'vue'
import { visible } from '@/core/observer'
import { getUID, getVue2Data } from '@/core/utils'
import { logError } from '@/core/utils/log'
import {
  getWatchlaterStatus,
  setWatchlaterStatus,
  watchlaterStatuses,
} from '@/components/video/watchlater'
import { forEachFeedsCard } from './api'

interface NativeVideoCard {
  data: { aid: string | number; title: string }
  mark: { done: boolean; loading: boolean }
  $watch: (key: string, callback: (value: boolean) => void) => () => void
  $once: (event: string, callback: () => void) => void
}

/** 原生动态按钮默认未添加；只为进入视区的卡片查询、同步状态。 */
export const initFeedsWatchlater = async () => {
  if (!getUID()) {
    return
  }
  const cleanups = new WeakMap<Element, () => void>()
  const [observer] = visible([], records => {
    records.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) {
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
      const sync = (added: boolean | undefined) => {
        // 原生按钮请求完成后会自行翻转 done，不能在请求期间改写它。
        if (added !== undefined && target.isConnected && !native.mark.loading) {
          native.mark.done = added
        }
      }
      if (!cleanups.has(target)) {
        // Vue 2 需要先创建响应式键，才能监听首次查询后的变化。
        if (!(aid in watchlaterStatuses)) {
          set(watchlaterStatuses, aid, undefined)
        }
        const stopStatus = watch(() => watchlaterStatuses[aid], sync, { immediate: true })
        const stopNative = native.$watch('mark.done', added => setWatchlaterStatus(aid, added))
        const cleanup = () => {
          stopStatus()
          stopNative()
          observer.unobserve(target)
          cleanups.delete(target)
        }
        cleanups.set(target, cleanup)
        native.$once('hook:beforeDestroy', cleanup)
      }
      getWatchlaterStatus(aid, native.data.title)
        .then(added => {
          sync(added)
          observer.unobserve(target)
        })
        .catch(logError)
    })
  })
  await forEachFeedsCard({
    added: ({ element }) => {
      element.querySelectorAll('.bili-dyn-card-video').forEach(card => observer.observe(card))
    },
    removed: ({ element }) => {
      element.querySelectorAll('.bili-dyn-card-video').forEach(card => {
        observer.unobserve(card)
        cleanups.get(card)?.()
        cleanups.delete(card)
      })
    },
  })
}
