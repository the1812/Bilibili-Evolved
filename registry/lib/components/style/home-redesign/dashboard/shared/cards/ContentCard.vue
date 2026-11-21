<template>
  <article
    class="dashboard-home-content-card"
    :class="{ 'is-embedded': embedded }"
    :data-kind="data.kind ?? 'video'"
  >
    <div class="dashboard-home-content-card-cover">
      <img
        v-if="data.coverUrl && data.coverSrcset"
        :src="data.coverUrl"
        :srcset="data.coverSrcset"
        alt=""
        loading="lazy"
        @error="fallbackToOriginalCover"
      />
      <DpiImage
        v-else-if="data.coverUrl"
        :src="data.coverUrl"
        :size="coverSize"
        alt=""
        loading="lazy"
      />
      <VIcon v-else :icon="placeholderIcons[data.kind ?? 'video']" :size="28" aria-hidden="true" />
      <span v-if="data.badge" class="dashboard-home-content-card-badge">{{ data.badge }}</span>
      <div
        v-if="data.durationText || canToggleWatchlater"
        class="dashboard-home-content-card-cover-controls"
      >
        <span v-if="data.durationText" class="dashboard-home-content-card-duration">
          {{ data.durationText }}
        </span>
        <button
          v-if="canToggleWatchlater"
          type="button"
          class="dashboard-home-content-card-watchlater"
          :title="isSavedForLater ? '从稍后再看移除' : '添加到稍后再看'"
          :aria-pressed="isSavedForLater ? 'true' : 'false'"
          :aria-disabled="watchlaterUnavailable ? 'true' : undefined"
          @click="toggleWatchlaterStatus"
        >
          <VIcon
            :icon="isSavedForLater ? 'mdi-check-circle' : 'mdi-clock-outline'"
            :size="15"
            aria-hidden="true"
          />
          <span>稍后再看</span>
        </button>
      </div>
      <progress
        v-if="data.progress !== undefined"
        class="dashboard-home-content-card-progress"
        :value="data.progress"
        max="1"
        aria-label="观看进度"
      />
    </div>
    <div class="dashboard-home-content-card-details">
      <div class="dashboard-home-content-card-copy">
        <div class="dashboard-home-content-card-text">
          <h2 class="dashboard-home-content-card-title">
            <component
              :is="cardUrl ? 'a' : 'span'"
              :href="cardUrl"
              :target="cardUrl ? '_blank' : undefined"
              :rel="cardUrl ? 'noopener' : undefined"
              :title="data.title"
            >
              {{ data.title }}
            </component>
          </h2>
          <p
            v-if="data.description"
            class="dashboard-home-content-card-description"
            :title="data.description"
          >
            {{ data.description }}
          </p>
          <p
            v-if="data.detail"
            class="dashboard-home-content-card-description"
            :title="data.detail"
          >
            {{ data.detail }}
          </p>
        </div>
        <div v-if="topics.length" class="dashboard-home-content-card-topics">
          <a
            v-for="topic in topics"
            :key="topic.id"
            :href="topic.url"
            :title="topic.name"
            target="_blank"
            rel="noopener"
          >
            <span aria-hidden="true">#</span>{{ topic.name }}
          </a>
        </div>
      </div>
      <footer
        v-if="uploaders.length || stats.length || $scopedSlots.stats"
        class="dashboard-home-content-card-footer"
      >
        <div v-if="uploaders.length" class="dashboard-home-content-card-uploaders">
          <template v-for="uploader in uploaders">
            <UpInfo
              v-if="uploader.id || uploader.url"
              :key="uploader.url || uploader.id"
              :href="uploader.url"
              :up-id="uploader.id"
              :up-name="uploader.name"
              :up-face-url="uploader.faceUrl"
            />
            <span v-else :key="uploader.name">{{ uploader.name }}</span>
          </template>
        </div>
        <div v-if="stats.length || $scopedSlots.stats" class="dashboard-home-content-card-stats">
          <slot name="stats" />
          <span v-for="stat in stats" :key="stat.icon" :title="`${stat.label} ${stat.count}`">
            <VIcon :icon="stat.icon" :size="14" aria-hidden="true" />
            <span class="dashboard-home-visually-hidden">{{ stat.label }}</span>
            {{ stat.count }}
          </span>
        </div>
      </footer>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import UpInfo from '@/components/feeds/UpInfo.vue'
import { toggleWatchlater, watchlaterList } from '@/components/video/watchlater'
import { getUID } from '@/core/utils'
import { logError } from '@/core/utils/log'
import { DpiImage, VIcon } from '@/ui'
import { getBangumiEpisodeUrl, getTopicUrl, getVideoUrl } from '../urls'
import type { ContentCardData, ContentCardKind } from './content-card'

const props = defineProps<{
  data: ContentCardData
  embedded?: boolean
  watchlaterDisabled?: boolean
  watchlaterAction?: (aid: number) => Promise<void>
}>()
const coverSize = { width: 480 }
const placeholderIcons: Record<ContentCardKind, string> = {
  video: 'mdi-play-box-multiple-outline',
  column: 'mdi-file-document-outline',
  bangumi: 'mdi-television-play',
  other: 'mdi-image-outline',
}
const signedIn = Boolean(getUID())
const savedVideos = ref(watchlaterList)
const watchlaterPending = ref(false)

const cardUrl = computed(() => {
  const { url, epID, bvid, aid } = props.data
  if (url) {
    return url
  }
  if (epID) {
    return getBangumiEpisodeUrl(epID)
  }
  if (bvid || aid) {
    return getVideoUrl(bvid || `av${aid}`)
  }
  return undefined
})
const topics = computed(() =>
  (props.data.topics ?? []).map(topic => ({
    ...topic,
    url: topic.url || getTopicUrl(topic.name),
  })),
)
const uploaders = computed<{ id?: number; name: string; faceUrl?: string; url?: string }[]>(() => {
  const { cooperation, upID, upName, upFaceUrl, upUrl } = props.data
  if (cooperation?.length) {
    return [...cooperation].reverse().slice(0, 3)
  }
  return upName ? [{ id: upID, name: upName, faceUrl: upFaceUrl, url: upUrl }] : []
})
const stats = computed(() => {
  const { like, playCount, danmakuCount, readCount, coins, favorites } = props.data
  return [
    { icon: 'like-outline', label: '点赞', count: like },
    { icon: 'play', label: '播放', count: playCount },
    { icon: 'danmaku', label: '弹幕', count: danmakuCount },
    { icon: 'mdi-book-open-outline', label: '阅读', count: readCount },
    { icon: 'coin-outline', label: '投币', count: coins },
    { icon: 'favorites-outline', label: '收藏', count: favorites },
  ].filter(stat => stat.count)
})

const watchlaterUnavailable = computed(() => watchlaterPending.value || props.watchlaterDisabled)
const canToggleWatchlater = computed(() => {
  const { aid, kind = 'video', watchlater } = props.data
  return kind === 'video' && signedIn && Number.isSafeInteger(aid) && aid > 0 && watchlater !== null
})
const isSavedForLater = computed(() => savedVideos.value.includes(props.data.aid))
const toggleWatchlaterStatus = async () => {
  if (!canToggleWatchlater.value || watchlaterUnavailable.value) {
    return
  }
  watchlaterPending.value = true
  try {
    await (props.watchlaterAction ?? toggleWatchlater)(props.data.aid)
  } catch (error) {
    logError(error)
  } finally {
    watchlaterPending.value = false
  }
}

const fallbackToOriginalCover = (event: Event) => {
  const cover = event.currentTarget as HTMLImageElement
  cover.removeAttribute('srcset')
}
</script>
