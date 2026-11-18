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
import { computed, del, reactive, ref, set } from 'vue'
import { getUID } from '@/core/utils'
import { logError, useScopedConsole } from '@/core/utils/log'
import { VButton, VEmpty, VIcon, VLoading } from '@/ui'
import DashboardHomeOperations from '../DashboardHomeOperations.vue'
import { useAutoLoad } from '../use-auto-load'
import DynamicCard from './DynamicCard.vue'
import {
  type DynamicEntry,
  type DynamicLikeState,
  type DynamicPost,
  getDynamicFeedPage,
  mergeDynamicReposts,
  setDynamicLike,
} from './dynamic-feed'

const { error: logFeedError } = useScopedConsole('仪表盘首页动态')
const loggedIn = Boolean(getUID())
const entries = ref<DynamicEntry[]>([])
const cards = computed(() => mergeDynamicReposts(entries.value))
const loading = ref(false)
const failed = ref(false)
const hasMore = ref(true)
let offset: string | undefined

const imagePreview = ref<HTMLDialogElement>()
const previewUrl = ref('')
const previewFailed = ref(false)
const openImagePreview = (url: string) => {
  previewUrl.value = url
  previewFailed.value = false
  imagePreview.value.showModal()
}
const closeImagePreview = () => imagePreview.value.close()

const likeStates = reactive<Record<string, DynamicLikeState>>({})
const toggleLike = async ({ id, stats }: DynamicPost) => {
  const like = stats?.like
  if (!like?.canToggle || likeStates[id]?.pending) {
    return
  }
  const current = likeStates[id] ?? { pending: false }
  const liked = (current.liked ?? like.liked) !== true
  set(likeStates, id, { ...current, pending: true })
  try {
    await setDynamicLike(id, liked)
    set(likeStates, id, { liked, pending: false })
  } catch (error) {
    set(likeStates, id, current)
    logError(error instanceof Error ? error : '更新点赞失败')
  }
}

const loadNextPage = async () => {
  if (loading.value || !hasMore.value) {
    return
  }
  loading.value = true
  failed.value = false
  try {
    const page = await getDynamicFeedPage(offset)
    entries.value = lodash.uniqBy([...entries.value, ...page.entries], entry => entry.id)
    hasMore.value = Boolean(page.nextOffset && page.nextOffset !== offset)
    offset = page.nextOffset
  } catch (error) {
    logFeedError(error)
    failed.value = true
  } finally {
    loading.value = false
  }
}

const loadMore = useAutoLoad(() => hasMore.value && !failed.value && !loading.value, loadNextPage)

const refresh = () => {
  if (loading.value) {
    return
  }
  for (const [id, state] of Object.entries(likeStates)) {
    if (!state.pending) {
      del(likeStates, id)
    }
  }
  entries.value = []
  offset = undefined
  hasMore.value = true
  loadNextPage()
}
</script>
