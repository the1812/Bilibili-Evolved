<template>
  <MasonryItem @resize="updateStatsSide">
    <article
      ref="cardElement"
      class="dashboard-home-dynamic-card"
      :class="{ 'stats-on-left': statsOnLeft }"
      @mouseenter="updateStatsSide"
      @focusin="updateStatsSide"
    >
      <div
        v-for="(post, index) in posts"
        :key="post.id"
        class="dashboard-home-dynamic-post"
        :class="{
          'is-repost': index > 0,
          'has-single-photo': post.images.length === 1,
          'has-only-photo': !post.text && !post.attachment,
        }"
      >
        <div class="dashboard-home-dynamic-controls">
          <header class="dashboard-home-dynamic-author">
            <div
              v-if="post.author.name || post.attachment || post.showOriginalLink"
              class="dashboard-home-dynamic-author-actions"
            >
              <UpInfo
                v-if="post.author.name"
                :up-id="post.author.id"
                :up-name="post.author.name"
                :up-face-url="post.author.avatar"
              />
              <span
                v-if="post.attachment && !post.originalLinkTypeLabel"
                class="dashboard-home-dynamic-attachment-type"
              >
                <VIcon :icon="post.attachment.type.icon" :size="14" aria-hidden="true" />
                {{ post.attachment.type.label }}
              </span>
              <a
                v-if="post.showOriginalLink"
                class="dashboard-home-dynamic-original-link"
                :class="{ 'has-type-label': post.originalLinkTypeLabel }"
                :href="post.url"
                target="_blank"
                rel="noopener"
                title="查看完整动态"
                :aria-label="
                  post.originalLinkTypeLabel
                    ? `${post.originalLinkTypeLabel} · 查看完整动态（在新标签页打开）`
                    : '查看完整动态（在新标签页打开）'
                "
              >
                <VIcon icon="mdi-open-in-new" :size="16" aria-hidden="true" />
                <span v-if="post.originalLinkTypeLabel">{{ post.originalLinkTypeLabel }}</span>
              </a>
            </div>
            <a
              v-if="post.publishedAt || !post.showOriginalLink"
              class="dashboard-home-dynamic-post-link"
              :href="post.url"
              target="_blank"
              rel="noopener"
              :title="post.publishedAt ? formatDateTime(post.publishedAt).slice(0, 16) : '查看动态'"
            >
              <time v-if="post.publishedAt" :datetime="post.publishedAt.toISOString()">
                {{ formatDynamicTimestamp(post.publishedAt) }}
              </time>
              <template v-else>查看动态</template>
            </a>
          </header>
          <div v-if="index === 0 && card.reposters.length" class="dashboard-home-dynamic-reposters">
            <div class="dashboard-home-dynamic-repost-users">
              <UpInfo
                v-for="repost in card.reposters"
                :key="repost.id"
                :href="repost.url"
                :up-name="repost.author.name || '用户'"
                :up-face-url="repost.author.avatar"
              />
            </div>
            <span
              class="dashboard-home-dynamic-repost-icon"
              role="img"
              aria-label="转发"
              title="转发"
            >
              <VIcon icon="mdi-twitter-retweet" :size="16" aria-hidden="true" />
            </span>
          </div>
          <DynamicStats
            v-if="hasStats(post)"
            :class="{ 'is-default-stats': post === defaultStatsPost }"
            :stats="post.stats"
            :like-state="likeStates[post.id]"
            @toggle-like="emit('toggle-like', post)"
          />
        </div>
        <p v-if="post.text" class="dashboard-home-dynamic-text">{{ post.text }}</p>
        <div
          v-if="post.images.length > 0"
          class="dashboard-home-dynamic-photos"
          :class="post.images.length === 1 ? 'is-single' : 'is-gallery'"
        >
          <button
            v-for="(image, imageIndex) in post.images"
            :key="imageIndex"
            type="button"
            :aria-label="`预览图片 ${imageIndex + 1}`"
            @click="emit('preview-image', image.url)"
          >
            <img
              :src="image.url"
              :srcset="getDynamicThumbnailSet(image.url, thumbnailWidth(post.images.length))"
              :width="image.width"
              :height="image.height"
              alt="动态图片"
              loading="lazy"
              @error="useOriginalImage"
            />
          </button>
        </div>
        <a
          v-if="post.attachment"
          class="dashboard-home-dynamic-attachment"
          :href="post.attachment.url"
          target="_blank"
          rel="noopener"
        >
          <img
            v-if="post.attachment.cover"
            :src="post.attachment.cover"
            :srcset="getDynamicThumbnailSet(post.attachment.cover, cardThumbnailWidth)"
            alt=""
            loading="lazy"
            @error="useOriginalImage"
          />
          <div class="dashboard-home-dynamic-attachment-details">
            <strong>{{ post.attachment.title }}</strong>
            <p v-if="post.attachment.description">{{ post.attachment.description }}</p>
          </div>
        </a>
      </div>
    </article>
  </MasonryItem>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import UpInfo from '@/components/feeds/UpInfo.vue'
import { formatDate, formatDateTime, formatTime } from '@/core/utils/formatters'
import { VIcon } from '@/ui'
import MasonryItem from '../../shared/MasonryItem.vue'
import DynamicStats from './DynamicStats.vue'
import {
  getDynamicThumbnailSet,
  type DynamicFeedCard,
  type DynamicLikeState,
  type DynamicPost,
} from './dynamic-post'

const props = defineProps<{ card: DynamicFeedCard; likeStates: Record<string, DynamicLikeState> }>()
const emit = defineEmits<{
  (event: 'preview-image', url: string): void
  (event: 'toggle-like', post: DynamicPost): void
}>()
const cardElement = ref<HTMLElement>()
const statsOnLeft = ref(false)
const updateStatsSide = () => {
  const card = cardElement.value
  const grid = card?.closest('.dashboard-home-masonry-grid')
  if (grid) {
    statsOnLeft.value =
      Math.abs(grid.getBoundingClientRect().right - card.getBoundingClientRect().right) < 1
  }
}

const posts = computed(() => {
  const { post, original, reposters } = props.card
  const primary =
    reposters.length && !post.stats ? { ...post, stats: { like: { canToggle: true } } } : post
  return original ? [primary, original] : [primary]
})
const hasStats = ({ stats }: DynamicPost) =>
  stats?.like?.canToggle ||
  stats?.like?.count !== undefined ||
  stats?.comments !== undefined ||
  stats?.reposts !== undefined
const defaultStatsPost = computed(() => posts.value.find(hasStats))

const formatDynamicTimestamp = (date: Date) => {
  const now = new Date()
  const day = formatDate(date)
  const time = formatTime(date).slice(0, 5)
  if (day === formatDate(now)) {
    return time
  }
  const dateLabel = date.getFullYear() === now.getFullYear() ? day.slice(5) : day
  return `${dateLabel} ${time}`
}

const cardThumbnailWidth = 480
const thumbnailWidth = (photoCount: number) => cardThumbnailWidth / Math.min(photoCount, 3)
const useOriginalImage = (event: Event) => {
  const image = event.currentTarget as HTMLImageElement
  image.removeAttribute('srcset')
}
</script>
