<template>
  <div class="dashboard-home-tab" :class="{ loading, loaded, error }">
    <div class="dashboard-home-tab-cards">
      <VideoCard v-for="card of cards" :key="card.id" :data="card" />
    </div>
    <VEmpty v-if="!loading && cards.length === 0" />
    <VLoading v-if="loading && cards.length === 0" />
    <DashboardHomeOperations v-if="cards.length > 0" @refresh="loadCards" />
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { VideoCard as VideoCardData } from '@/components/feeds/video-card'
import VideoCard from '@/components/feeds/VideoCard.vue'
import { logError } from '@/core/utils/log'
import { VEmpty, VLoading } from '@/ui'
import { getTrendingVideos } from '../../../trending'
import DashboardHomeOperations from '../../shared/DashboardHomeOperations.vue'

const props = defineProps<{ personalized?: boolean }>()
const loading = ref(true)
const error = ref(false)
const cards = ref<VideoCardData[]>([])
const loaded = computed(() => !loading.value && !error.value)

const loadCards = async () => {
  try {
    cards.value = []
    error.value = false
    loading.value = true
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
