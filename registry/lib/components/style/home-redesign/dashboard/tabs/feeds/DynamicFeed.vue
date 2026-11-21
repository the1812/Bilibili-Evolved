<template>
  <div class="dashboard-home-card-view dashboard-home-dynamic">
    <VEmpty v-if="!loggedIn">登录后查看关注{{ feedLabel }}</VEmpty>
    <template v-else>
      <ul
        v-if="liveRooms.length"
        class="dashboard-home-card-grid"
        role="list"
        aria-label="正在直播"
      >
        <CardGridItem v-for="room in liveRooms" :key="room.id">
          <article class="dashboard-home-dynamic-live-room">
            <div class="dashboard-home-dynamic-live-avatar">
              <DpiImage v-if="room.avatar" :src="room.avatar" :size="36" alt="" loading="lazy" />
              <VIcon v-else icon="mdi-video-outline" :size="24" aria-hidden="true" />
            </div>
            <div class="dashboard-home-dynamic-live-details">
              <h2 class="dashboard-home-dynamic-live-title">
                <a :href="room.url" :title="room.title" target="_blank" rel="noopener">
                  {{ room.title }}
                </a>
              </h2>
              <a
                v-if="room.name && room.profileUrl"
                class="dashboard-home-dynamic-live-profile"
                :href="room.profileUrl"
                :title="room.name"
                :aria-label="`${room.name}（个人空间）`"
                target="_blank"
                rel="noopener"
              >
                {{ room.name }}
              </a>
              <span v-else-if="room.name && room.name !== room.title" :title="room.name">
                {{ room.name }}
              </span>
            </div>
          </article>
        </CardGridItem>
      </ul>
      <CardCollection :class="{ 'dashboard-home-card-collection-dated': feedType !== 'all' }">
        <ul
          v-if="feedType === 'all' && feedCards.length"
          class="dashboard-home-card-grid"
          role="list"
        >
          <DynamicCard
            v-for="card in feedCards"
            :key="card.post.id"
            :card="card"
            :like-states="likeStates"
            @preview-image="openImagePreview"
            @toggle-like="toggleLike"
          />
        </ul>
        <div
          v-else-if="feedType !== 'all' && datedCardGroups.length"
          class="dashboard-home-feed-days"
        >
          <FeedDateGroup
            v-for="group in datedCardGroups"
            :key="group.date"
            :date="group.date"
            :label="group.label"
          >
            <CardGridItem v-for="card in group.cards" :key="card.id">
              <ContentCard :data="card.data">
                <template v-if="hasDynamicStats(card.post.stats)" #stats>
                  <DynamicStats
                    :stats="card.post.stats"
                    :like-state="likeStates[card.post.id]"
                    @toggle-like="toggleLike(card.post)"
                  />
                </template>
              </ContentCard>
            </CardGridItem>
          </FeedDateGroup>
        </div>
        <ListStatus
          ref="loadTarget"
          class="dashboard-home-card-list-end"
          :loading="loading"
          :failed="failed"
          :has-more="hasMore"
          :empty="!hasMore && !loadedEntries.length ? `暂无关注${feedLabel}` : ''"
          @load="loadNext"
        />
      </CardCollection>
      <DashboardHomeOperations :refresh-disabled="loading" @refresh="refresh" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Toast } from '@/core/toast'
import { DpiImage, showImage, VEmpty, VIcon } from '@/ui'
import { TabOption } from '../../options'
import CardCollection from '../../shared/cards/CardCollection.vue'
import CardGridItem from '../../shared/cards/CardGridItem.vue'
import ContentCard from '../../shared/cards/ContentCard.vue'
import type { ContentCardData } from '../../shared/cards/content-card'
import DashboardHomeOperations from '../../shared/DashboardHomeOperations.vue'
import FeedDateGroup from './FeedDateGroup.vue'
import ListStatus from '../../shared/ListStatus.vue'
import { groupCardsByDate } from './group-feed-cards'
import DynamicCard from './DynamicCard.vue'
import DynamicStats from './DynamicStats.vue'
import type { DynamicFeedType } from './dynamic-api'
import { getDynamicThumbnailSet, hasDynamicStats } from './dynamic-post'
import { useDynamicFeed } from './use-dynamic-feed'

const props = withDefaults(defineProps<{ feedType?: DynamicFeedType }>(), { feedType: 'all' })
const feedLabel = { all: TabOption.Dynamic, pgc: TabOption.Bangumi, column: TabOption.Column }[
  props.feedType
]

const {
  loggedIn,
  entries: loadedEntries,
  cards: feedCards,
  liveRooms,
  loading,
  failed,
  hasMore,
  likeStates,
  loadTarget,
  loadNext,
  toggleLike,
  refresh,
} = useDynamicFeed(props.feedType)

const datedCardGroups = computed(() => {
  const kind = props.feedType === 'pgc' ? 'bangumi' : 'column'
  const contentCards = feedCards.value.map(card => {
    const post = card.original ?? card.post
    const { attachment, author } = post
    const coverUrl = attachment?.coverUrl ?? post.images[0]?.url
    const data: ContentCardData = {
      ...attachment,
      kind,
      title: attachment?.title || post.text || `查看完整${feedLabel}`,
      url: attachment?.url ?? post.url,
      description: attachment?.description || (attachment ? post.text : undefined),
      coverUrl,
      coverSrcset: attachment?.coverSrcset ?? (coverUrl && getDynamicThumbnailSet(coverUrl, 480)),
      upID: kind === 'bangumi' ? undefined : author.id,
      upName: author.name,
      upFaceUrl: author.avatar,
      upUrl: author.url,
    }
    return { id: card.post.id, data, post }
  })
  return groupCardsByDate(contentCards, card => card.post.publishedAt)
})

let isOpeningImagePreview = false
const openImagePreview = async (url: string) => {
  if (isOpeningImagePreview) {
    return
  }
  isOpeningImagePreview = true
  try {
    await showImage(url)
  } catch {
    Toast.error('图片加载失败', '图片预览')
  } finally {
    isOpeningImagePreview = false
  }
}
</script>
