<template>
  <div class="dashboard-home-list-status">
    <div role="status">
      <VLoading v-if="loading" />
      <span v-else-if="failed">{{ error }}</span>
      <VEmpty v-else-if="empty">{{ empty }}</VEmpty>
    </div>
    <VButton v-if="!loading && (failed || hasMore)" @click="$emit('load')">
      {{ failed ? '重试' : '加载更多' }}
    </VButton>
  </div>
</template>

<script setup lang="ts">
import { VButton, VEmpty, VLoading } from '@/ui'

withDefaults(
  defineProps<{
    loading: boolean
    failed: boolean
    hasMore?: boolean
    empty?: string
    error?: string
  }>(),
  { hasMore: false, empty: '', error: '加载失败' },
)
defineEmits<{ (event: 'load'): void }>()
</script>
