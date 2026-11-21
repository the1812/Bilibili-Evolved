<template>
  <div
    ref="collectionElement"
    :class="{ 'dashboard-home-card-collection-vertical': isVertical }"
    :tabindex="isVertical ? 0 : null"
    :role="isVertical ? 'region' : null"
    :aria-label="isVertical ? '从右向左浏览卡片' : null"
    :style="isVertical ? scrollLayoutStyle : null"
    @wheel="scrollWithWheel"
  >
    <div class="dashboard-home-card-collection-track">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue'
import { sizeChange } from '@/core/observer'
import { contentCardLayoutKey } from './content-card'

const minimumRowBlockSize = 224
const preferredRowBlockSize = 320

const layout = inject(contentCardLayoutKey)
const collectionElement = ref<HTMLElement>()
const scrollLayoutStyle = ref<Record<string, string | number>>()
const isVertical = computed(() => layout?.value === 'vertical')

const scrollWithWheel = (event: WheelEvent) => {
  if (!isVertical.value || event.defaultPrevented || event.ctrlKey || event.shiftKey) {
    return
  }
  const { deltaMode, deltaX, deltaY } = event
  if (Math.abs(deltaX) >= Math.abs(deltaY)) {
    return
  }

  const element = event.currentTarget as HTMLElement
  const maxScrollLeft = element.scrollWidth - element.clientWidth
  let distance = deltaY
  if (deltaMode === WheelEvent.DOM_DELTA_LINE) {
    distance *= 16
  } else if (deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    distance *= element.clientWidth
  }
  const nextScrollLeft = Math.min(0, Math.max(-maxScrollLeft, element.scrollLeft - distance))
  if (nextScrollLeft !== element.scrollLeft) {
    event.preventDefault()
    element.scrollLeft = nextScrollLeft
  }
}

watch(
  () => (isVertical.value ? collectionElement.value : undefined),
  (element, _, onCleanup) => {
    if (!element) {
      return
    }
    const measure = () => {
      // Measure from the document top so scrolling does not change the row count.
      let documentTop = 0
      for (
        let ancestor: Element | null = element;
        ancestor instanceof HTMLElement;
        ancestor = ancestor.offsetParent
      ) {
        documentTop += ancestor.offsetTop
      }
      const blockSize = Math.max(minimumRowBlockSize, window.innerHeight - documentTop - 12)
      const style = getComputedStyle(element)
      const paddingBlockStart = parseFloat(
        style.getPropertyValue('--dashboard-home-card-scroll-padding-block-start'),
      )
      const paddingBlockEnd = parseFloat(
        style.getPropertyValue('--dashboard-home-card-scroll-padding-block-end'),
      )
      const headerBlockSize = parseFloat(
        style.getPropertyValue('--dashboard-home-card-scroll-header-block-size'),
      )
      const rowGap = parseFloat(style.getPropertyValue('--dashboard-home-grid-gap'))
      const availableRowSpace = blockSize - paddingBlockStart - paddingBlockEnd - headerBlockSize
      const countRows = (rowBlockSize: number) =>
        Math.max(1, Math.floor((availableRowSpace + rowGap) / (rowBlockSize + rowGap)))
      scrollLayoutStyle.value = {
        '--dashboard-home-card-scroll-block-size': `${blockSize}px`,
        '--dashboard-home-card-max-row-count': countRows(minimumRowBlockSize),
        '--dashboard-home-card-auto-row-count': countRows(preferredRowBlockSize),
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
</script>
