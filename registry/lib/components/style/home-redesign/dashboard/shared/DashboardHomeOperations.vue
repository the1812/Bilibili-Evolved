<template>
  <div
    ref="operations"
    class="dashboard-home-operations"
    :class="{ 'is-horizontal-scroll': horizontalScroll }"
  >
    <VButton
      round
      icon
      class="dashboard-home-operations-refresh"
      title="刷新"
      aria-label="刷新"
      :disabled="refreshDisabled"
      @click="refresh"
    >
      <VIcon icon="mdi-refresh" :size="size" aria-hidden="true" />
    </VButton>
    <VButton
      round
      icon
      class="dashboard-home-operations-start"
      :title="returnLabel"
      :aria-label="returnLabel"
      @click="scrollToStart"
    >
      <VIcon
        :icon="horizontalScroll ? 'mdi-arrow-right' : 'mdi-arrow-up'"
        :size="size"
        aria-hidden="true"
      />
    </VButton>
  </div>
</template>
<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { VButton, VIcon } from '@/ui'
import { contentCardLayoutKey } from './content-card'

const emit = defineEmits<{ (event: 'refresh'): void }>()
const props = defineProps<{ refreshDisabled?: boolean }>()
const size = 28
const layout = inject(contentCardLayoutKey)
const operations = ref<HTMLElement>()
const horizontalScroll = computed(() => layout?.value === 'vertical')
const returnLabel = computed(() => (horizontalScroll.value ? '返回开头' : '返回顶部'))
const scrollToStart = () => {
  const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
  const collection = operations.value
    ?.closest('[role="tabpanel"]')
    ?.querySelector('.dashboard-home-card-collection.is-horizontal-scroll')
  collection?.scrollTo({ left: 0, behavior })
  window.scrollTo({ top: 0, behavior })
}
const refresh = () => {
  if (props.refreshDisabled) {
    return
  }
  scrollToStart()
  emit('refresh')
}
</script>
