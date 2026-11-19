<template>
  <div class="dashboard-home-card-view dashboard-home-dynamic">
    <VEmpty v-if="!loggedIn">登录后查看关注{{ feedLabel }}</VEmpty>
    <template v-else>
      <ul
        v-if="liveRooms.length"
        class="dashboard-home-card-grid dashboard-home-live-grid"
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
              <a
                class="dashboard-home-dynamic-live-title"
                :href="room.url"
                :title="room.title"
                target="_blank"
                rel="noopener"
              >
                <strong>{{ room.title }}</strong>
              </a>
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
      <CardCollection :class="{ 'dashboard-home-dated-collection': feedType !== 'all' }">
        <ul v-if="feedType === 'all' && cards.length" class="dashboard-home-card-grid" role="list">
          <DynamicCard
            v-for="card in cards"
            :key="card.post.id"
            :card="card"
            :like-states="likeStates"
            @preview-image="openImagePreview"
            @toggle-like="toggleLike"
          />
        </ul>
        <div
          v-else-if="feedType !== 'all' && contentCardGroups.length"
          class="dashboard-home-feed-days"
        >
          <FeedDateGroup
            v-for="group in contentCardGroups"
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
        <div ref="loadTarget" class="dashboard-home-card-end">
          <ListStatus
            :loading="loading"
            :failed="failed"
            :has-more="hasMore"
            :empty="!hasMore && !entries.length ? `暂无关注${feedLabel}` : ''"
            @load="loadNext"
          />
        </div>
      </CardCollection>
      <DashboardHomeOperations :refresh-disabled="loading" @refresh="refresh" />
    </template>
    <dialog
      v-if="feedType === 'all'"
      ref="imagePreview"
      class="dashboard-home-dynamic-image-preview"
      aria-label="图片预览"
      @click.self="closeImagePreview"
      @close="clearImagePreview"
    >
      <button type="button" aria-label="关闭图片预览" autofocus @click="closeImagePreview">
        <VIcon icon="mdi-close" :size="24" aria-hidden="true" />
      </button>
      <img
        v-if="previewUrl && !previewFailed"
        :src="previewUrl"
        alt="动态图片"
        @error="previewFailed = true"
      />
      <p v-if="previewFailed" role="status">图片加载失败</p>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { DpiImage, VEmpty, VIcon } from '@/ui'
import { TabOption } from '../../options'
import CardCollection from '../../shared/CardCollection.vue'
import CardGridItem from '../../shared/CardGridItem.vue'
import ContentCard from '../../shared/ContentCard.vue'
import type { ContentCardData } from '../../shared/content-card'
import DashboardHomeOperations from '../../shared/DashboardHomeOperations.vue'
import FeedDateGroup from '../../shared/FeedDateGroup.vue'
import ListStatus from '../../shared/ListStatus.vue'
import { groupFeedCardsByDate } from '../../shared/group-feed-cards'
import DynamicCard from './DynamicCard.vue'
import DynamicStats from './DynamicStats.vue'
import type { DynamicFeedType } from './dynamic-api'
import { getDynamicThumbnailSet, hasDynamicStats } from './dynamic-post'
import { useDynamicFeed } from './use-dynamic-feed'

const props = withDefaults(defineProps<{ feedType?: DynamicFeedType }>(), { feedType: 'all' })
const feedLabel = { all: TabOption.Dynamic, pgc: TabOption.Bangumi, article: TabOption.Article }[
  props.feedType
]

const {
  loggedIn,
  entries,
  cards,
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

const contentCardGroups = computed(() => {
  const kind = props.feedType === 'pgc' ? 'bangumi' : 'article'
  const contentCards = cards.value.map(card => {
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
  return groupFeedCardsByDate(contentCards, card => card.post.publishedAt)
})

const imagePreview = ref<HTMLDialogElement>()
const previewUrl = ref('')
const previewFailed = ref(false)
const openImagePreview = (url: string) => {
  previewUrl.value = url
  previewFailed.value = false
  const dialog = imagePreview.value
  if (dialog && !dialog.open) {
    dialog.showModal()
  }
}
const closeImagePreview = () => imagePreview.value?.close()
const clearImagePreview = () => {
  if (!imagePreview.value?.open) {
    previewUrl.value = ''
  }
}
</script>
