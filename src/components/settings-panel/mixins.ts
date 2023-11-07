import { ref, onMounted } from 'vue'
import type { Ref } from 'vue'

export const useVirtualScroll = (
  containerSelector: string,
): { el: Ref<HTMLElement | null>; virtual: Ref<boolean> } => {
  const el = ref(null) as Ref<HTMLElement | null>
  const virtual = ref(false)

  // code in virtualScrollMixin -> mounted
  onMounted(async () => {
    const { dq } = await import('@/core/utils')
    const { visibleInside } = await import('@/core/observer')
    const container = dq(containerSelector) as HTMLElement
    if (!container) {
      console.warn('virtual container not found, virtual scroll will be disabled!')
      return
    }
    visibleInside(el.value, container, '150% 0px', records => {
      records.forEach(record => {
        virtual.value = !record.isIntersecting
      })
    })
  })

  return {
    el,
    virtual,
  }
}
