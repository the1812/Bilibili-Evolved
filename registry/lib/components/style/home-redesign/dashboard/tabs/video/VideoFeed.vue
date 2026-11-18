<template>
  <div class="dashboard-home-tab" :class="{ loading, loaded, error }">
    <div v-for="group in cardGroups" :key="group.date" class="dashboard-home-feed-day">
      <time
        v-if="group.date"
        class="dashboard-home-feed-date"
        :datetime="group.date"
        :title="group.date"
      >
        {{ group.label }}
      </time>
      <div class="dashboard-home-tab-cards">
        <VideoCard v-for="card in group.cards" :key="card.id" :data="card" />
      </div>
    </div>
    <VEmpty v-if="!loading && cards.length === 0" />
    <ScrollTrigger v-if="!error" ref="scrollTrigger" detect-viewport @trigger="loadCards" />
    <DashboardHomeOperations v-if="cards.length > 0" @refresh="refresh" />
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { getVideoFeeds } from '@/components/feeds/api'
import type { VideoCard as VideoCardData } from '@/components/feeds/video-card'
import VideoCard from '@/components/feeds/VideoCard.vue'
import { logError } from '@/core/utils/log'
import { ascendingStringSort } from '@/core/utils/sort'
import { ScrollTrigger, VEmpty } from '@/ui'
import DashboardHomeOperations from '../../shared/DashboardHomeOperations.vue'
import { groupVideoCardsByDate } from './group-video-cards'

const scrollTrigger = ref<InstanceType<typeof ScrollTrigger>>()
const loading = ref(true)
const error = ref(false)
const cards = ref<VideoCardData[]>([])
const loaded = computed(() => !loading.value && !error.value)
const cardGroups = computed(() => groupVideoCardsByDate(cards.value))
const lastId = computed(
  () => [...cards.value].sort(ascendingStringSort(card => card.id))[0]?.id ?? null,
)

const loadCards = async () => {
  try {
    error.value = false
    loading.value = true
    scrollTrigger.value?.setLoadState('loading')
    cards.value = lodash.uniqBy(
      [...cards.value, ...(await getVideoFeeds('video', lastId.value))],
      card => card.id,
    )
  } catch (loadError) {
    logError(loadError)
    error.value = true
    scrollTrigger.value?.setLoadState('error')
  } finally {
    loading.value = false
    if (loaded.value) {
      scrollTrigger.value?.setLoadState('loaded')
    }
  }
}

const refresh = () => {
  cards.value = []
  scrollTrigger.value?.resetIsFirstLoad()
}
</script>
