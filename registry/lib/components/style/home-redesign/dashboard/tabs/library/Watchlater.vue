<template>
  <div class="dashboard-home-card-view dashboard-home-library">
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
      <p v-if="actionFailed" class="dashboard-home-list-status" role="status">操作失败，请重试</p>
      <CardCollection>
        <LibraryCards :entries="entries" :watchlater-disabled="busy" :watchlater-action="remove" />
        <ListStatus
          class="dashboard-home-card-end"
          :loading="loading"
          :failed="failed"
          :empty="emptyMessage"
          @load="refresh"
        />
      </CardCollection>
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
import { VEmpty } from '@/ui'
import CardCollection from '../../shared/CardCollection.vue'
import DashboardHomeOperations from '../../shared/DashboardHomeOperations.vue'
import ListStatus from '../../shared/ListStatus.vue'
import LibraryCards from './LibraryCards.vue'
import LibraryToolbar from './LibraryToolbar.vue'
import {
  filterLibraryEntries,
  getLibraryEmptyMessage,
  getPlaybackProgress,
  type LibraryEntry,
} from './library'

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
const isWatched = (item: RawWatchlaterItem) => item.progress === -1
const hasWatched = computed(() => queue.value.some(isWatched))
const entries = computed(() => {
  const cards = queue.value
    .filter(item => filter.value === 'all' || (filter.value === 'watched') === isWatched(item))
    .map((item): LibraryEntry => {
      const page = item.pages?.find(part => part.cid === item.cid)
      const duration = page?.duration ?? item.duration
      return {
        id: item.aid,
        aid: item.aid,
        title: item.title,
        url: videoUrl(item),
        coverUrl: item.bangumi?.cover || item.pic,
        durationText: duration > 0 ? formatDuration(duration) : undefined,
        upName: item.owner?.name,
        upID: item.owner?.mid,
        upFaceUrl: item.owner?.face,
        detail: isWatched(item) ? '已看完' : undefined,
        progress: getPlaybackProgress(item.progress, duration),
      }
    })
  return filterLibraryEntries(cards, keyword.value)
})
const emptyMessage = computed(() =>
  getLibraryEmptyMessage({
    entries: queue.value,
    matches: entries.value,
    filtering: filter.value !== 'all' || Boolean(keyword.value.trim()),
    empty: '稍后再看列表为空',
  }),
)

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
const remove = (aid: number) =>
  updateQueue(async () => {
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
    const removed = new Set(
      queue.value.filter(item => !viewed || isWatched(item)).map(item => item.aid),
    )
    queue.value = queue.value.filter(item => !removed.has(item.aid))
    const remaining = viewed ? watchlaterList.filter(aid => !removed.has(aid)) : []
    watchlaterList.splice(0, watchlaterList.length, ...remaining)
  })
}

onMounted(refresh)
</script>
