<template>
  <div class="dashboard-home-masonry-feed dashboard-home-dynamic" :aria-busy="loading">
    <VEmpty v-if="!loggedIn">登录后查看关注{{ feedLabel }}</VEmpty>
    <template v-else>
      <ul
        v-if="liveRooms.length"
        class="dashboard-home-masonry-grid"
        role="list"
        aria-label="正在直播"
      >
        <MasonryItem v-for="room in liveRooms" :key="room.id" tag="li">
          <a
            :href="room.url"
            target="_blank"
            rel="noopener"
            class="dashboard-home-dynamic-live-room"
          >
            <DpiImage v-if="room.avatar" :src="room.avatar" :size="36" alt="" loading="lazy" />
            <VIcon v-else icon="mdi-video-outline" :size="24" aria-hidden="true" />
            <div class="dashboard-home-dynamic-live-details">
              <strong :title="room.title">{{ room.title }}</strong>
              <span v-if="room.name && room.name !== room.title" :title="room.name">
                {{ room.name }}
              </span>
            </div>
          </a>
        </MasonryItem>
      </ul>
      <div class="dashboard-home-masonry-grid">
        <DynamicCard
          v-for="card in cards"
          :key="card.post.id"
          :card="card"
          :like-states="likeStates"
          @preview-image="openImagePreview"
          @toggle-like="toggleLike"
        />
      </div>
      <div ref="loadMore" class="dashboard-home-masonry-status">
        <VLoading v-if="loading" />
        <VButton v-else-if="failed" @click="loadNextPage">加载失败，点击重试</VButton>
        <VButton v-else-if="hasMore" @click="loadNextPage">加载更多</VButton>
        <VEmpty v-else-if="entries.length === 0">暂无关注{{ feedLabel }}</VEmpty>
      </div>
      <DashboardHomeOperations v-if="entries.length || liveRooms.length" @refresh="refresh" />
    </template>
    <dialog
      ref="imagePreview"
      class="dashboard-home-dynamic-image-preview"
      aria-label="图片预览"
      @click.self="closeImagePreview"
      @close="previewUrl = ''"
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
import { ref } from 'vue'
import { DpiImage, VButton, VEmpty, VIcon, VLoading } from '@/ui'
import DashboardHomeOperations from '../../shared/DashboardHomeOperations.vue'
import MasonryItem from '../../shared/MasonryItem.vue'
import DynamicCard from './DynamicCard.vue'
import type { DynamicFeedType } from './dynamic-api'
import { useDynamicFeed } from './use-dynamic-feed'

const props = withDefaults(defineProps<{ feedType?: DynamicFeedType }>(), { feedType: 'all' })
const feedLabel = { all: '动态', pgc: '番剧', article: '专栏' }[props.feedType]

const {
  loggedIn,
  entries,
  cards,
  liveRooms,
  loading,
  failed,
  hasMore,
  likeStates,
  loadMore,
  loadNextPage,
  toggleLike,
  refresh,
} = useDynamicFeed(props.feedType)

const imagePreview = ref<HTMLDialogElement>()
const previewUrl = ref('')
const previewFailed = ref(false)
const openImagePreview = (url: string) => {
  previewUrl.value = url
  previewFailed.value = false
  imagePreview.value.showModal()
}
const closeImagePreview = () => imagePreview.value.close()
</script>
