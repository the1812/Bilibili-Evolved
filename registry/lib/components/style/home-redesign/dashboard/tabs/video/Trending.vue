<template>
  <div class="dashboard-home-card-view">
    <CardCollection>
      <ul v-if="cards.length" class="dashboard-home-card-grid" role="list">
        <CardGridItem v-for="card in cards" :key="card.id">
          <ContentCard :data="card" />
        </CardGridItem>
      </ul>
      <ListStatus
        class="dashboard-home-card-list-end"
        :loading="loading"
        :failed="failed"
        :empty="cards.length ? '' : '暂无视频'"
        @load="loadCards"
      />
    </CardCollection>
    <DashboardHomeOperations :refresh-disabled="loading" @refresh="loadCards" />
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { VideoCard as VideoCardData } from '@/components/feeds/video-card'
import { logError } from '@/core/utils/log'
import { getTrendingVideos } from '../../../trending'
import CardCollection from '../../shared/CardCollection.vue'
import CardGridItem from '../../shared/CardGridItem.vue'
import DashboardHomeOperations from '../../shared/DashboardHomeOperations.vue'
import ContentCard from '../../shared/ContentCard.vue'
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
