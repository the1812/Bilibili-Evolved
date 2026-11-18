<template>
  <component :is="tag" ref="item" class="dashboard-home-masonry-item">
    <slot />
  </component>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { sizeChange } from '@/core/observer'

withDefaults(defineProps<{ tag?: 'div' | 'li' }>(), { tag: 'div' })
const emit = defineEmits<{ (event: 'resize'): void }>()

const item = ref<HTMLElement>()
let observer: ResizeObserver
onMounted(() => {
  const element = item.value
  const rowHeight = parseFloat(
    getComputedStyle(element).getPropertyValue('--dashboard-home-masonry-row-height'),
  )
  const updateRowSpan = () => {
    const rows = Math.ceil(element.offsetHeight / rowHeight)
    if (rows > 0) {
      element.style.setProperty('--dashboard-home-masonry-rows', String(rows))
    }
    emit('resize')
  }
  updateRowSpan()
  const [resizeObserver] = sizeChange(element, updateRowSpan)
  observer = resizeObserver
})
onBeforeUnmount(() => observer?.disconnect())
</script>
