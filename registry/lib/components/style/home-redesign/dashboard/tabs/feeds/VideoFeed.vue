<template>
  <div class="dashboard-home-card-view">
    <VEmpty v-if="!loggedIn">登录后查看关注视频</VEmpty>
    <CardCollection v-else :dated="cardList.dated">
      <div v-if="cardList.groups.length" class="dashboard-home-card-date-groups">
        <CardDateGroup
          v-for="group in cardList.groups"
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
        </CardDateGroup>
      </div>
      <ListStatus
        ref="loadTarget"
        class="dashboard-home-card-list-end"
        :loading="loading"
        :failed="failed"
        :has-more="hasMore"
        :empty="!hasMore && !cards.length ? '暂无关注视频' : ''"
        @load="loadNext"
      />
    </CardCollection>
    <DashboardHomeOperations v-if="loggedIn" :refresh-disabled="loading" @refresh="refresh" />
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { getUID } from '@/core/utils'
import { VEmpty } from '@/ui'
import { useDashboardOption } from '../../options'
import CardCollection from '../../shared/cards/CardCollection.vue'
import CardGridItem from '../../shared/cards/CardGridItem.vue'
import DashboardHomeOperations from '../../shared/DashboardHomeOperations.vue'
import ContentCard from '../../shared/cards/ContentCard.vue'
import CardDateGroup from '../../shared/cards/CardDateGroup.vue'
import ListStatus from '../../shared/ListStatus.vue'
import { getCardList } from '../../shared/cards/card-list'
import { usePagedList } from '../../shared/use-paged-list'
import DynamicStats from './DynamicStats.vue'
import { hasDynamicStats } from './dynamic-post'
import { useDynamicLike } from './use-dynamic-like'
import { getVideoFeedPage, type VideoFeedCard } from './video-feed-api'

const loggedIn = Boolean(getUID())
const groupByDate = useDashboardOption('videoGroupByDate')
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
const cardList = computed(() =>
  getCardList(cards.value, {
    groupByDate: groupByDate.value,
    getDate: card => card.time,
  }),
)
const refresh = () => {
  resetLikeStates()
  return refreshCards()
}
</script>
