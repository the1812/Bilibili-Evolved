<template>
  <div
    class="dashboard-home-dynamic-stats"
    :class="{ 'is-flyout': flyout }"
    role="group"
    aria-label="动态数据"
  >
    <div class="dashboard-home-dynamic-stats-items">
      <button
        v-if="stats.like?.canToggle"
        type="button"
        class="dashboard-home-dynamic-stats-item"
        :aria-label="likeCount === undefined ? '点赞' : `点赞 ${likeCount}`"
        :aria-pressed="liked === undefined ? undefined : liked ? 'true' : 'false'"
        :aria-disabled="likeState?.pending ? 'true' : undefined"
        :title="liked ? '取消点赞' : '点赞'"
        @click="emit('toggle-like')"
      >
        <VIcon
          :icon="liked ? 'mdi-thumb-up' : 'mdi-thumb-up-outline'"
          :size="14"
          aria-hidden="true"
        />
        <template v-if="likeCount !== undefined">{{ formatCount(likeCount) }}</template>
      </button>
      <span
        v-for="item in readOnlyStats"
        :key="item.label"
        class="dashboard-home-dynamic-stats-item"
        :title="`${item.label} ${item.count}`"
      >
        <VIcon :icon="item.icon" :size="14" aria-hidden="true" />
        <span class="dashboard-home-visually-hidden">{{ item.label }} {{ item.count }}</span>
        <span aria-hidden="true">{{ formatCount(item.count) }}</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatCount } from '@/core/utils/formatters'
import { VIcon } from '@/ui'
import type { DynamicLikeState, DynamicPost } from './dynamic-post'

const props = defineProps<{
  stats: NonNullable<DynamicPost['stats']>
  likeState?: DynamicLikeState
  flyout?: boolean
}>()
const emit = defineEmits<{ (event: 'toggle-like'): void }>()
const liked = computed(() => props.likeState?.liked ?? props.stats.like?.liked)
const likeCount = computed(() => {
  const { count, liked: feedLiked } = props.stats.like ?? {}
  if (count === undefined || feedLiked === undefined || liked.value === feedLiked) {
    return count
  }
  return Math.max(0, count + (liked.value ? 1 : -1))
})
const readOnlyStats = computed(() =>
  [
    {
      label: '点赞',
      icon: liked.value ? 'mdi-thumb-up' : 'mdi-thumb-up-outline',
      count: props.stats.like?.canToggle ? undefined : likeCount.value,
    },
    { label: '评论', icon: 'mdi-comment-outline', count: props.stats.comments },
    { label: '转发', icon: 'mdi-twitter-retweet', count: props.stats.reposts },
    { label: '投币', icon: 'coin-outline', count: props.stats.coins },
    { label: '收藏', icon: 'favorites-outline', count: props.stats.favorites },
  ].filter(item => item.count !== undefined),
)
</script>
