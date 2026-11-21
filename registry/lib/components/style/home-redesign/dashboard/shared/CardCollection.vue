<template>
  <div
    ref="collection"
    class="dashboard-home-card-collection"
    :class="`dashboard-home-card-collection-${layout}`"
    :tabindex="isVertical ? 0 : null"
    :role="isVertical ? 'region' : null"
    :aria-label="isVertical ? '从右向左浏览卡片' : null"
    :style="isVertical ? scrollLayout : null"
    @wheel="scrollWithWheel"
  >
    <div class="dashboard-home-card-track">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue'
import { sizeChange } from '@/core/observer'
import { contentCardLayoutKey } from './content-card'

const layout = inject(contentCardLayoutKey)
const isVertical = computed(() => layout?.value === 'vertical')
const collection = ref<HTMLElement>()
const scrollLayout = ref<Record<string, string | number>>()
const minimumRowHeight = 224
const preferredRowHeight = 320

watch(
  () => (isVertical.value ? collection.value : undefined),
  (element, _, onCleanup) => {
    if (!element) {
      return
    }
    const measure = () => {
      // Measure from the document top so scrolling does not change the row count.
      let top = 0
      for (let ancestor = element; ancestor; ancestor = ancestor.offsetParent as HTMLElement) {
        top += ancestor.offsetTop
      }
      const height = Math.max(minimumRowHeight, window.innerHeight - top - 12)
      const style = getComputedStyle(element)
      const topPadding = parseFloat(
        style.getPropertyValue('--dashboard-home-card-scroll-top-padding'),
      )
      const bottomPadding = parseFloat(
        style.getPropertyValue('--dashboard-home-card-scroll-bottom-padding'),
      )
      const headerHeight = parseFloat(
        style.getPropertyValue('--dashboard-home-card-scroll-header-height'),
      )
      const rowGap = parseFloat(style.getPropertyValue('--dashboard-home-grid-gap'))
      const rowsHeight = height - topPadding - bottomPadding - headerHeight
      const fitRows = (rowHeight: number) =>
        Math.max(1, Math.floor((rowsHeight + rowGap) / (rowHeight + rowGap)))
      scrollLayout.value = {
        '--dashboard-home-card-scroll-height': `${height}px`,
        '--dashboard-home-card-available-rows': fitRows(minimumRowHeight),
        '--dashboard-home-card-auto-rows': fitRows(preferredRowHeight),
      }
    }
    measure()
    const tabBar = element.closest('.dashboard-home-tabs')?.querySelector('.dashboard-home-tab-bar')
    const [observer] = sizeChange([element.parentElement, tabBar].filter(Boolean), measure)
    window.addEventListener('resize', measure)
    onCleanup(() => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    })
  },
  { flush: 'post' },
)

const scrollWithWheel = (event: WheelEvent) => {
  if (
    !isVertical.value ||
    event.defaultPrevented ||
    event.ctrlKey ||
    event.shiftKey ||
    Math.abs(event.deltaX) >= Math.abs(event.deltaY)
  ) {
    return
  }
  const element = event.currentTarget as HTMLElement
  const maxScroll = element.scrollWidth - element.clientWidth
  let distance = event.deltaY
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
    distance *= 16
  } else if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    distance *= element.clientWidth
  }
  const next = Math.min(0, Math.max(-maxScroll, element.scrollLeft - distance))
  if (next !== element.scrollLeft) {
    event.preventDefault()
    element.scrollLeft = next
  }
}
</script>
