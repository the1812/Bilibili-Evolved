<template>
  <div class="dashboard-home-library-status" role="status">
    <VLoading v-if="loading" />
    <VButton v-else-if="failed" @click="$emit('load')">加载失败，点击重试</VButton>
    <VEmpty v-else-if="empty">{{ empty }}</VEmpty>
    <VButton v-if="!loading && !failed && hasMore" @click="$emit('load')">加载更多</VButton>
  </div>
</template>

<script setup lang="ts">
import { VButton, VEmpty, VLoading } from '@/ui'

defineProps<{ loading: boolean; failed: boolean; hasMore?: boolean; empty?: string }>()
defineEmits<{ (event: 'load'): void }>()
</script>
