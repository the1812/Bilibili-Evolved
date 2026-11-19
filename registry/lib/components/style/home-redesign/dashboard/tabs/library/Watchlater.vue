<template>
  <div class="dashboard-home-library">
    <VEmpty v-if="!uid">登录后查看稍后再看</VEmpty>
    <template v-else>
      <LibraryToolbar :value="keyword" @input="keyword = $event">
        <template #filters>
          <label>
            <span>观看状态</span>
            <select v-model="filter">
              <option value="all">全部</option>
              <option value="unwatched">未看完</option>
              <option value="watched">已看完</option>
            </select>
          </label>
        </template>
        <template #actions>
          <a v-if="queue.length" :href="playAllUrl" target="_blank" rel="noopener">播放全部</a>
          <button type="button" :disabled="busy || !hasWatched" @click="clearQueue(true)">
            移除已看完
          </button>
          <button type="button" :disabled="busy || !queue.length" @click="clearQueue(false)">
            清空列表
          </button>
        </template>
      </LibraryToolbar>
      <p v-if="actionFailed" class="dashboard-home-library-status" role="status">
        操作失败，请重试
      </p>
      <LibraryCards :entries="entries">
        <template #actions="{ item }">
          <VButton :disabled="busy" :aria-label="`移除 ${item.title}`" @click="remove(item.id)">
            移除
          </VButton>
        </template>
      </LibraryCards>
      <LibraryPageStatus
        :loading="loading"
        :failed="failed"
        :empty="entries.length ? '' : queue.length ? '没有符合条件的视频' : '稍后再看列表为空'"
        @load="refresh"
      />
      <DashboardHomeOperations :refresh-disabled="busy" @refresh="refresh" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  getWatchlaterList,
  toggleWatchlater,
  watchlaterList,
  type RawWatchlaterItem,
} from '@/components/video/watchlater'
import { bilibiliApi, postTextWithCredentials } from '@/core/ajax'
import { getCsrf, getUID } from '@/core/utils'
import { formatDuration } from '@/core/utils/formatters'
import { useScopedConsole } from '@/core/utils/log'
import { VButton, VEmpty } from '@/ui'
import DashboardHomeOperations from '../../shared/DashboardHomeOperations.vue'
import LibraryCards from './LibraryCards.vue'
import LibraryPageStatus from './LibraryPageStatus.vue'
import LibraryToolbar from './LibraryToolbar.vue'
import { filterLibraryEntries, libraryProgress, type LibraryEntry } from './library'

const uid = getUID()
const { error: logError } = useScopedConsole('仪表盘首页稍后再看')
const queue = ref<RawWatchlaterItem[]>([])
const loading = ref(false)
const updating = ref(false)
const failed = ref(false)
const actionFailed = ref(false)
const keyword = ref('')
const filter = ref<'all' | 'watched' | 'unwatched'>('all')
const busy = computed(() => loading.value || updating.value)

const queueUrl = 'https://www.bilibili.com/list/watchlater'
const videoUrl = (item: RawWatchlaterItem) =>
  item.bvid ? `${queueUrl}?bvid=${item.bvid}` : `https://www.bilibili.com/video/av${item.aid}`
const playAllUrl = computed(() => (queue.value[0]?.bvid ? videoUrl(queue.value[0]) : queueUrl))
const isWatched = (item: RawWatchlaterItem) => item.progress < 0
const hasWatched = computed(() => queue.value.some(isWatched))
const entries = computed(() => {
  const cards = queue.value
    .filter(item => filter.value === 'all' || (filter.value === 'watched') === isWatched(item))
    .map((item): LibraryEntry => {
      const page = item.pages?.find(part => part.cid === item.cid)
      const duration = page?.duration ?? item.duration
      return {
        id: item.aid,
        title: item.title,
        url: videoUrl(item),
        cover: item.bangumi?.cover || item.pic,
        badge: duration > 0 ? formatDuration(duration) : undefined,
        detail: [item.owner?.name, isWatched(item) ? '已看完' : undefined]
          .filter(Boolean)
          .join(' · '),
        progress: libraryProgress(item.progress, duration),
      }
    })
  return filterLibraryEntries(cards, keyword.value)
})

const loadQueue = async () => {
  loading.value = true
  failed.value = false
  try {
    queue.value = await getWatchlaterList(true)
  } catch (error) {
    logError(error)
    failed.value = true
  } finally {
    loading.value = false
  }
}
const refresh = () => {
  if (uid && !busy.value) {
    actionFailed.value = false
    return loadQueue()
  }
  return undefined
}

const updateQueue = async (apply: () => Promise<void>) => {
  if (!uid || busy.value) {
    return
  }
  updating.value = true
  actionFailed.value = false
  try {
    await apply()
  } catch (error) {
    logError(error)
    actionFailed.value = true
  } finally {
    updating.value = false
  }
}
const remove = (id: string | number) =>
  updateQueue(async () => {
    const aid = Number(id)
    await toggleWatchlater(aid, false)
    if (watchlaterList.includes(aid)) {
      actionFailed.value = true
      return
    }
    queue.value = queue.value.filter(item => item.aid !== aid)
  })
const clearQueue = async (viewed: boolean) => {
  if (busy.value || !window.confirm(viewed ? '移除所有已看完的视频？' : '清空整个稍后再看列表？')) {
    return
  }
  await updateQueue(async () => {
    const csrf = getCsrf()
    if (!csrf) {
      throw new Error('登录已失效')
    }
    const body = new URLSearchParams({ csrf })
    if (viewed) {
      body.set('viewed', 'true')
    }
    const action = viewed ? 'del' : 'clear'
    await bilibiliApi(
      postTextWithCredentials(
        `https://api.bilibili.com/x/v2/history/toview/${action}`,
        body.toString(),
      ).then(JSON.parse),
      '更新稍后再看失败',
      false,
    )
    if (!viewed) {
      queue.value = []
      watchlaterList.splice(0)
    }
    await loadQueue()
  })
}

onMounted(refresh)
</script>
