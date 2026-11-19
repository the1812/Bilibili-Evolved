<template>
  <div class="dashboard-home-operations">
    <VButton
      round
      icon
      class="dashboard-home-operations-refresh"
      title="刷新"
      :disabled="refreshDisabled"
      @click="refresh"
    >
      <VIcon icon="mdi-refresh" :size="size" />
    </VButton>
    <VButton round icon class="dashboard-home-operations-top" title="返回顶部" @click="backToTop">
      <VIcon icon="mdi-arrow-up" :size="size" />
    </VButton>
  </div>
</template>
<script setup lang="ts">
import { VButton, VIcon } from '@/ui'

const emit = defineEmits<{ (event: 'refresh'): void }>()
const props = defineProps<{ refreshDisabled?: boolean }>()
const size = 28
const backToTop = () => window.scrollTo(0, 0)
const refresh = () => {
  if (props.refreshDisabled) {
    return
  }
  backToTop()
  emit('refresh')
}
</script>
