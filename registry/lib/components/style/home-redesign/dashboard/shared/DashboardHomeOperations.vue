<template>
  <div ref="operations" class="dashboard-home-operations">
    <button
      type="button"
      class="dashboard-home-action dashboard-home-operations-refresh"
      title="刷新"
      aria-label="刷新"
      :aria-disabled="refreshDisabled ? 'true' : undefined"
      @click="refresh"
    >
      <VIcon icon="mdi-refresh" :size="28" aria-hidden="true" />
    </button>
    <button
      type="button"
      class="dashboard-home-action dashboard-home-operations-scroll-start"
      :title="layout === 'vertical' ? '返回开头' : '返回顶部'"
      :aria-label="layout === 'vertical' ? '返回开头' : '返回顶部'"
      @click="start"
    >
      <VIcon
        :icon="layout === 'vertical' ? 'mdi-arrow-right' : 'mdi-arrow-up'"
        :size="28"
        aria-hidden="true"
      />
    </button>
  </div>
</template>
<script setup lang="ts">
import { inject, ref } from 'vue'
import { VIcon } from '@/ui'
import { contentCardLayoutKey } from './content-card'

const emit = defineEmits<{ (event: 'refresh'): void }>()
const props = defineProps<{ refreshDisabled?: boolean }>()
const layout = inject(contentCardLayoutKey)
const operations = ref<HTMLElement>()

const scrollToStart = (moveFocus = false) => {
  const panel = operations.value?.closest<HTMLElement>('[role="tabpanel"]')
  if (moveFocus) {
    panel?.focus({ preventScroll: true })
  }
  const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
  panel?.querySelector('.dashboard-home-card-collection-vertical')?.scrollTo({ left: 0, behavior })
  window.scrollTo({ top: 0, behavior })
}

const start = (event: MouseEvent) => scrollToStart(event.detail === 0)

const refresh = () => {
  if (props.refreshDisabled) {
    return
  }
  scrollToStart()
  emit('refresh')
}
</script>
