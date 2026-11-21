<template>
  <div class="dashboard-home-list-status">
    <div ref="statusElement" role="status" tabindex="-1">
      <VLoading v-if="loading" role="progressbar" aria-label="正在加载" />
      <span v-else-if="failed">{{ error }}</span>
      <VEmpty v-else-if="empty">{{ empty }}</VEmpty>
      <span v-else-if="showCompletion">加载完成</span>
    </div>
    <button
      v-if="showLoadButton"
      ref="loadButton"
      class="dashboard-home-action"
      type="button"
      :aria-disabled="loading ? 'true' : undefined"
      @click="handleLoad"
    >
      {{ loadButtonLabel }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch, watchEffect } from 'vue'
import { VEmpty, VLoading } from '@/ui'

const props = withDefaults(
  defineProps<{
    loading: boolean
    failed: boolean
    hasMore?: boolean
    empty?: string
    error?: string
    loadLabel?: string
  }>(),
  { hasMore: false, empty: '', error: '加载失败', loadLabel: '加载更多' },
)
const emit = defineEmits<{ (event: 'load'): void }>()
const statusElement = ref<HTMLElement>()
const loadButton = ref<HTMLButtonElement>()
const showCompletion = ref(false)
const loadButtonLabel = ref(props.loadLabel)
const showLoadButton = computed(() =>
  props.loading ? Boolean(loadButton.value) : props.failed || props.hasMore,
)

const handleLoad = () => {
  if (!props.loading) {
    emit('load')
  }
}

watchEffect(() => {
  if (!props.loading) {
    loadButtonLabel.value = props.failed ? '重试' : props.loadLabel
  }
})

// Keep the same action in view as results arrive, or focus the status when it goes away.
watch([showLoadButton, () => props.loading], async ([visible, loading]) => {
  if (visible || loading) {
    showCompletion.value = false
  }
  const button = loadButton.value
  if (loading || !button || document.activeElement !== button) {
    return
  }
  showCompletion.value = !visible
  await nextTick()
  if (document.activeElement === button) {
    button.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  } else if (!button.isConnected && document.activeElement === document.body) {
    statusElement.value?.focus()
  }
})

onBeforeUnmount(() => {
  if (loadButton.value && document.activeElement === loadButton.value) {
    const panel = loadButton.value.closest<HTMLElement>('[role="tabpanel"]')
    nextTick(() => {
      if (panel?.isConnected && !panel.hidden && document.activeElement === document.body) {
        panel.focus({ preventScroll: true })
      }
    })
  }
})
</script>
