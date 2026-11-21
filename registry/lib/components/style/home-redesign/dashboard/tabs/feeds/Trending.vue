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
        :empty="cards.length ? '' : `暂无${feedLabel}视频`"
        :error="`${feedLabel}视频加载失败`"
        @load="loadCards"
      />
    </CardCollection>
    <DashboardHomeOperations :refresh-disabled="loading" @refresh="loadCards" />
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { VideoCard as VideoCardData } from '@/components/feeds/video-card'
import { logError } from '@/core/utils/log'
import { getTrendingVideos } from '../../../trending'
import CardCollection from '../../shared/cards/CardCollection.vue'
import CardGridItem from '../../shared/cards/CardGridItem.vue'
import DashboardHomeOperations from '../../shared/DashboardHomeOperations.vue'
import ContentCard from '../../shared/cards/ContentCard.vue'
import ListStatus from '../../shared/ListStatus.vue'

const props = defineProps<{ personalized?: boolean }>()
const feedLabel = computed(() => (props.personalized ? '推荐' : '热门'))
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
