<template>
  <div class="dashboard-home-masonry-feed dashboard-home-dynamic" :aria-busy="loading">
    <VEmpty v-if="!loggedIn">登录 B 站后查看关注动态</VEmpty>
    <template v-else>
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
        <VEmpty v-else-if="entries.length === 0">暂无关注动态</VEmpty>
      </div>
      <DashboardHomeOperations v-if="entries.length > 0" @refresh="refresh" />
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
import { VButton, VEmpty, VIcon, VLoading } from '@/ui'
import DashboardHomeOperations from '../../shared/DashboardHomeOperations.vue'
import DynamicCard from './DynamicCard.vue'
import { useDynamicFeed } from './use-dynamic-feed'

const {
  loggedIn,
  entries,
  cards,
  loading,
  failed,
  hasMore,
  likeStates,
  loadMore,
  loadNextPage,
  toggleLike,
  refresh,
} = useDynamicFeed()

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
