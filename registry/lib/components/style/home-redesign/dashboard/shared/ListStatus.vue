<template>
  <div class="dashboard-home-list-status">
    <div role="status">
      <VLoading v-if="loading" />
      <VEmpty v-else-if="!failed && empty">{{ empty }}</VEmpty>
    </div>
    <VButton v-if="!loading && failed" @click="$emit('load')">加载失败，点击重试</VButton>
    <VButton v-else-if="!loading && hasMore" @click="$emit('load')">加载更多</VButton>
  </div>
</template>

<script setup lang="ts">
import { VButton, VEmpty, VLoading } from '@/ui'

defineProps<{ loading: boolean; failed: boolean; hasMore?: boolean; empty?: string }>()
defineEmits<{ (event: 'load'): void }>()
</script>
