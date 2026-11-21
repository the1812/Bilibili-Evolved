<template>
  <li ref="item" class="dashboard-home-card-grid-item">
    <slot />
  </li>
</template>

<script setup lang="ts">
import { inject, ref, watch } from 'vue'
import { sizeChange } from '@/core/observer'
import { contentCardLayoutKey } from './content-card'

const emit = defineEmits<{ (event: 'resize'): void }>()
const item = ref<HTMLElement>()
const layout = inject(contentCardLayoutKey)
watch(
  () => (layout?.value === 'compact' ? item.value : undefined),
  (element, _, onCleanup) => {
    if (!element) {
      return
    }
    const rowHeight = parseFloat(
      getComputedStyle(element).getPropertyValue('--dashboard-home-masonry-row-height'),
    )
    const updateRowSpan = () => {
      const rows = Math.ceil(element.getBoundingClientRect().height / rowHeight)
      if (rows > 0) {
        element.style.setProperty('--dashboard-home-masonry-rows', String(rows))
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
