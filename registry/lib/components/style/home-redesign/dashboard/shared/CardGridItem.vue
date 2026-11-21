<template>
  <li ref="gridItem" class="dashboard-home-card-grid-item">
    <slot />
  </li>
</template>

<script setup lang="ts">
import { inject, ref, watch } from 'vue'
import { sizeChange } from '@/core/observer'
import { contentCardLayoutKey } from './content-card'

const emit = defineEmits<{ (event: 'resize'): void }>()
const gridItem = ref<HTMLElement>()
const layout = inject(contentCardLayoutKey)

watch(
  () => (layout?.value === 'compact' ? gridItem.value : undefined),
  (element, _, onCleanup) => {
    if (!element) {
      return
    }
    const rowBlockSize = parseFloat(
      getComputedStyle(element).getPropertyValue('--dashboard-home-masonry-row-block-size'),
    )
    const updateRowSpan = () => {
      const rowSpan = Math.ceil(element.getBoundingClientRect().height / rowBlockSize)
      if (Number.isFinite(rowSpan) && rowSpan > 0) {
        element.style.setProperty('--dashboard-home-masonry-row-span', String(rowSpan))
      }
      emit('resize')
    }
    updateRowSpan()
    const [observer] = sizeChange(element, updateRowSpan)
    onCleanup(() => observer.disconnect())
  },
  { flush: 'post' },
)
</script>
