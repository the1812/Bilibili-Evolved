import { ref, watch } from 'vue'
import { visible } from '@/core/observer'

export const useAutoLoad = (canLoad: () => boolean, loadNextPage: () => Promise<void>) => {
  const target = ref<HTMLElement>()
  watch(
    () => (canLoad() ? target.value : undefined),
    (element, _, onCleanup) => {
      if (!element) {
        return
      }
      const [observer] = visible(element, records => {
        if (canLoad() && records.some(record => record.isIntersecting)) {
          loadNextPage()
        }
      })
      onCleanup(() => observer.disconnect())
    },
    { flush: 'post' },
  )
  return target
}
