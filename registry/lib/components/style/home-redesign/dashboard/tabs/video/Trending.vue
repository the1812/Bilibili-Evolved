<template>
  <div class="dashboard-home-tab">
    <div class="dashboard-home-tab-cards">
      <VideoCard v-for="card of cards" :key="card.id" :data="card" />
    </div>
    <ListStatus
      :loading="loading"
      :failed="failed"
      :empty="cards.length ? '' : '暂无视频'"
      @load="loadCards"
    />
    <DashboardHomeOperations :refresh-disabled="loading" @refresh="loadCards" />
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { VideoCard as VideoCardData } from '@/components/feeds/video-card'
import VideoCard from '@/components/feeds/VideoCard.vue'
import { logError } from '@/core/utils/log'
import { getTrendingVideos } from '../../../trending'
import DashboardHomeOperations from '../../shared/DashboardHomeOperations.vue'
import ListStatus from '../../shared/ListStatus.vue'

const props = defineProps<{ personalized?: boolean }>()
const loading = ref(false)
const failed = ref(false)
const cards = ref<VideoCardData[]>([])

const loadCards = async () => {
  if (loading.value) {
    return
  }
  loading.value = true
  failed.value = false
  try {
    cards.value = await getTrendingVideos(props.personalized)
  } catch (loadError) {
    logError(loadError)
    failed.value = true
  } finally {
    loading.value = false
  }
}

onMounted(loadCards)
</script>
