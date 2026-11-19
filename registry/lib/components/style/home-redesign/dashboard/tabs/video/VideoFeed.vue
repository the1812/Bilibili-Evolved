<template>
  <div class="dashboard-home-tab">
    <div v-for="group in cardGroups" :key="group.date" class="dashboard-home-feed-day">
      <time
        v-if="group.label !== ''"
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
    <div ref="loadTarget">
      <ListStatus
        :loading="loading"
        :failed="failed"
        :has-more="hasMore"
        :empty="emptyMessage"
        @load="loadNext"
      />
    </div>
    <DashboardHomeOperations v-if="loggedIn" :refresh-disabled="loading" @refresh="refresh" />
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { VideoCard as VideoCardData } from '@/components/feeds/video-card'
import VideoCard from '@/components/feeds/VideoCard.vue'
import { getUID } from '@/core/utils'
import DashboardHomeOperations from '../../shared/DashboardHomeOperations.vue'
import ListStatus from '../../shared/ListStatus.vue'
import { usePagedList } from '../../shared/use-paged-list'
import { groupVideoCardsByDate } from './group-video-cards'
import { getVideoFeedPage } from './video-feed-api'

const loggedIn = Boolean(getUID())
const {
  entries: cards,
  loading,
  failed,
  hasMore,
  loadTarget,
  loadNext,
  refresh,
} = usePagedList<VideoCardData, string>({
  source: () => (loggedIn ? 'video' : undefined),
  fetchPage: getVideoFeedPage,
  getKey: card => card.id,
  logName: '仪表盘首页视频',
})
const cardGroups = computed(() => groupVideoCardsByDate(cards.value))
const emptyMessage = computed(() => {
  if (!loggedIn) {
    return '登录后查看关注视频'
  }
  return !cards.value.length && !hasMore.value ? '暂无关注视频' : ''
})
</script>
