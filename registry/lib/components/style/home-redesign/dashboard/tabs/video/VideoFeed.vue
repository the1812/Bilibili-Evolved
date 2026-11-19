<template>
  <div class="dashboard-home-card-view">
    <CardCollection class="dashboard-home-dated-collection">
      <div class="dashboard-home-feed-days">
        <FeedDateGroup
          v-for="group in cardGroups"
          :key="group.date"
          :date="group.date"
          :label="group.label"
        >
          <CardGridItem v-for="card in group.cards" :key="card.id">
            <ContentCard :data="{ ...card, like: undefined }">
              <template v-if="hasDynamicStats(card.postStats)" #stats>
                <DynamicStats
                  :stats="card.postStats"
                  :like-state="likeStates[card.id]"
                  @toggle-like="toggleLike({ id: card.id, stats: card.postStats })"
                />
              </template>
            </ContentCard>
          </CardGridItem>
        </FeedDateGroup>
      </div>
      <div ref="loadTarget" class="dashboard-home-card-end">
        <ListStatus
          :loading="loading"
          :failed="failed"
          :has-more="hasMore"
          :empty="emptyMessage"
          @load="loadNext"
        />
      </div>
    </CardCollection>
    <DashboardHomeOperations v-if="loggedIn" :refresh-disabled="loading" @refresh="refresh" />
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { getUID } from '@/core/utils'
import CardCollection from '../../shared/CardCollection.vue'
import CardGridItem from '../../shared/CardGridItem.vue'
import DashboardHomeOperations from '../../shared/DashboardHomeOperations.vue'
import ContentCard from '../../shared/ContentCard.vue'
import FeedDateGroup from '../../shared/FeedDateGroup.vue'
import ListStatus from '../../shared/ListStatus.vue'
import { groupFeedCardsByDate } from '../../shared/group-feed-cards'
import { usePagedList } from '../../shared/use-paged-list'
import DynamicStats from '../dynamic/DynamicStats.vue'
import { hasDynamicStats } from '../dynamic/dynamic-post'
import { useDynamicLike } from '../dynamic/use-dynamic-like'
import { getVideoFeedPage, type VideoFeedCard } from './video-feed-api'

const loggedIn = Boolean(getUID())
const { likeStates, toggleLike, resetLikeStates } = useDynamicLike()
const {
  entries: cards,
  loading,
  failed,
  hasMore,
  loadTarget,
  loadNext,
  refresh: refreshCards,
} = usePagedList<VideoFeedCard, string>({
  source: () => (loggedIn ? 'video' : undefined),
  fetchPage: getVideoFeedPage,
  getKey: card => card.id,
  logName: '仪表盘首页视频',
})
const cardGroups = computed(() => groupFeedCardsByDate(cards.value, card => card.time))
const refresh = () => {
  resetLikeStates()
  return refreshCards()
}
const emptyMessage = computed(() => {
  if (!loggedIn) {
    return '登录后查看关注视频'
  }
  return !cards.value.length && !hasMore.value ? '暂无关注视频' : ''
})
</script>
