<template>
  <div class="dashboard-home-tab" :class="{ loading, loaded, error }" :aria-busy="loading">
    <div class="dashboard-home-tab-cards">
      <VideoCard v-for="card of cards" :key="card.id" :data="card" />
    </div>
    <div class="dashboard-home-tab-status">
      <VLoading v-if="loading" />
      <VButton v-else-if="error" @click="loadCards">加载失败，点击重试</VButton>
      <VEmpty v-else-if="!cards.length" />
    </div>
    <DashboardHomeOperations v-if="cards.length > 0" @refresh="loadCards" />
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { VideoCard as VideoCardData } from '@/components/feeds/video-card'
import VideoCard from '@/components/feeds/VideoCard.vue'
import { logError } from '@/core/utils/log'
import { VButton, VEmpty, VLoading } from '@/ui'
import { getTrendingVideos } from '../../../trending'
import DashboardHomeOperations from '../../shared/DashboardHomeOperations.vue'

const props = defineProps<{ personalized?: boolean }>()
const loading = ref(false)
const error = ref(false)
const cards = ref<VideoCardData[]>([])
const loaded = computed(() => !loading.value && !error.value)

const loadCards = async () => {
  if (loading.value) {
    return
  }
  loading.value = true
  error.value = false
  try {
    cards.value = await getTrendingVideos(props.personalized)
  } catch (loadError) {
    logError(loadError)
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(loadCards)
</script>
