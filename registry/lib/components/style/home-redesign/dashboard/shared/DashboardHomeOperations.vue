<template>
  <div
    ref="operations"
    class="dashboard-home-operations"
    :class="`dashboard-home-operations-${layout}`"
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
      <VIcon icon="mdi-refresh" :size="28" aria-hidden="true" />
    </VButton>
    <VButton
      round
      icon
      class="dashboard-home-operations-start"
      :title="layout === 'vertical' ? '返回开头' : '返回顶部'"
      :aria-label="layout === 'vertical' ? '返回开头' : '返回顶部'"
      :disabled="startDisabled"
      @click="start"
    >
      <VIcon
        :icon="layout === 'vertical' ? 'mdi-arrow-right' : 'mdi-arrow-up'"
        :size="28"
        aria-hidden="true"
      />
    </VButton>
  </div>
</template>
<script setup lang="ts">
import { inject, ref } from 'vue'
import { VButton, VIcon } from '@/ui'
import { contentCardLayoutKey } from './content-card'

const emit = defineEmits<{ (event: 'refresh'): void; (event: 'start'): void }>()
const props = defineProps<{ refreshDisabled?: boolean; startDisabled?: boolean }>()
const layout = inject(contentCardLayoutKey)
const operations = ref<HTMLElement>()

const scrollToStart = () => {
  const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
  operations.value
    ?.closest('[role="tabpanel"]')
    ?.querySelector('.dashboard-home-card-collection-vertical')
    ?.scrollTo({ left: 0, behavior })
  window.scrollTo({ top: 0, behavior })
}

const start = () => {
  if (props.startDisabled) {
    return
  }
  scrollToStart()
  emit('start')
}

const refresh = () => {
  if (props.refreshDisabled) {
    return
  }
  scrollToStart()
  emit('refresh')
}
</script>
