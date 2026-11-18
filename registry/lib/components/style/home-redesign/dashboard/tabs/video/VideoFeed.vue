<template>
  <div class="dashboard-home-tab" :class="{ loading, loaded, error }" :aria-busy="loading">
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
    <div ref="loadMore" class="dashboard-home-tab-status">
      <VEmpty v-if="!loggedIn">登录后查看关注视频</VEmpty>
      <VLoading v-else-if="loading" />
      <VButton v-else-if="error" @click="loadCards">加载失败，点击重试</VButton>
      <VButton v-else-if="hasMore" @click="loadCards">加载更多</VButton>
      <VEmpty v-else-if="!cards.length">暂无关注视频</VEmpty>
    </div>
    <DashboardHomeOperations v-if="cards.length > 0" @refresh="refresh" />
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import type { VideoCard as VideoCardData } from '@/components/feeds/video-card'
import VideoCard from '@/components/feeds/VideoCard.vue'
import { getUID } from '@/core/utils'
import { logError } from '@/core/utils/log'
import { VButton, VEmpty, VLoading } from '@/ui'
import DashboardHomeOperations from '../../shared/DashboardHomeOperations.vue'
import { useAutoLoad } from '../../shared/use-auto-load'
import { groupVideoCardsByDate } from './group-video-cards'
import { getVideoFeedPage } from './video-feed-api'

const loggedIn = Boolean(getUID())
const loading = ref(false)
const error = ref(false)
const hasMore = ref(loggedIn)
const cards = ref<VideoCardData[]>([])
const loaded = computed(() => !loading.value && !error.value)
const cardGroups = computed(() => groupVideoCardsByDate(cards.value))
const seenOffsets = new Set<string>()
let offset: string | undefined

const loadCards = async () => {
  if (loading.value || !hasMore.value) {
    return
  }
  loading.value = true
  error.value = false
  try {
    const page = await getVideoFeedPage(offset)
    cards.value = lodash.uniqBy([...cards.value, ...page.cards], card => card.id)
    offset = page.nextOffset
    hasMore.value = Boolean(offset && !seenOffsets.has(offset))
    if (hasMore.value) {
      seenOffsets.add(offset)
    }
  } catch (loadError) {
    logError(loadError)
    error.value = true
  } finally {
    loading.value = false
  }
}

const loadMore = useAutoLoad(() => hasMore.value && !loading.value && !error.value, loadCards)

const refresh = () => {
  if (loading.value) {
    return
  }
  cards.value = []
  offset = undefined
  seenOffsets.clear()
  hasMore.value = true
  loadCards()
}
</script>
