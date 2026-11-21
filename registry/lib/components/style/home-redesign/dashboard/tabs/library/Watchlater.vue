<template>
  <div class="dashboard-home-card-view dashboard-home-library">
    <VEmpty v-if="!uid">登录后查看稍后再看</VEmpty>
    <template v-else>
      <LibraryToolbar :value="keyword" @input="keyword = $event">
        <template #filters>
          <label>
            <span>观看状态</span>
            <select ref="watchStatusSelect" v-model="watchStatus">
              <option value="all">全部</option>
              <option value="unwatched">未看完</option>
              <option value="watched">已看完</option>
            </select>
          </label>
        </template>
        <template #actions>
          <a v-if="queue.length" :href="playAllUrl" target="_blank" rel="noopener">播放全部</a>
          <button
            type="button"
            :aria-disabled="busy || !hasWatched ? 'true' : undefined"
            @click="clearQueue(true)"
          >
            移除已看完
          </button>
          <button
            type="button"
            :aria-disabled="busy || !queue.length ? 'true' : undefined"
            @click="clearQueue(false)"
          >
            清空列表
          </button>
        </template>
      </LibraryToolbar>
      <p class="dashboard-home-library-status" role="status">
        {{ actionFailed ? '操作失败，请重试' : '' }}
      </p>
      <CardCollection>
        <LibraryCards
          :entries="filteredEntries"
          :watchlater-disabled="busy"
          :watchlater-action="removeVideo"
        />
        <ListStatus
          class="dashboard-home-card-list-end"
          :loading="loading"
          :failed="failed"
          :empty="emptyMessage"
          @load="refreshQueue"
        />
      </CardCollection>
      <DashboardHomeOperations :refresh-disabled="busy" @refresh="refreshQueue" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { watchlaterList, type RawWatchlaterItem } from '@/components/video/watchlater'
import { getUID } from '@/core/utils'
import { formatDuration } from '@/core/utils/formatters'
import { useScopedConsole } from '@/core/utils/log'
import { VEmpty } from '@/ui'
import CardCollection from '../../shared/cards/CardCollection.vue'
import DashboardHomeOperations from '../../shared/DashboardHomeOperations.vue'
import ListStatus from '../../shared/ListStatus.vue'
import { dashboardUrls, getWatchlaterVideoUrl } from '../../shared/urls'
import LibraryCards from './LibraryCards.vue'
import LibraryToolbar from './LibraryToolbar.vue'
import {
  filterLibraryEntries,
  getLibraryEmptyMessage,
  getPlaybackProgress,
  type LibraryEntry,
} from './library'
import { clearWatchlater, getWatchlaterQueue, removeWatchlater } from './watchlater-api'

const uid = getUID()
const { error: logError } = useScopedConsole('仪表盘首页稍后再看')
const queue = ref<RawWatchlaterItem[]>([])
const loading = ref(false)
const updating = ref(false)
const failed = ref(false)
const actionFailed = ref(false)
const keyword = ref('')
const watchStatus = ref<'all' | 'watched' | 'unwatched'>('all')
const watchStatusSelect = ref<HTMLSelectElement>()
const busy = computed(() => loading.value || updating.value)

const playAllUrl = computed(() => {
  const item = queue.value[0]
  return item?.bvid ? getWatchlaterVideoUrl(item.aid, item.bvid) : dashboardUrls.watchlaterQueue
})
const isWatched = (item: RawWatchlaterItem) => item.progress === -1
const hasWatched = computed(() => queue.value.some(isWatched))
const filteredEntries = computed(() => {
  const cards = queue.value
    .filter(
      item => watchStatus.value === 'all' || (watchStatus.value === 'watched') === isWatched(item),
    )
    .map((item): LibraryEntry => {
      const page = item.pages?.find(part => part.cid === item.cid)
      const duration = page?.duration ?? item.duration
      return {
        id: item.aid,
        aid: item.aid,
        title: item.title,
        url: getWatchlaterVideoUrl(item.aid, item.bvid),
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
    matches: filteredEntries.value,
    filtering: watchStatus.value !== 'all' || Boolean(keyword.value.trim()),
    empty: '稍后再看列表为空',
  }),
)

const refreshQueue = async () => {
  if (!uid || busy.value) {
    return
  }
  actionFailed.value = false
  loading.value = true
  failed.value = false
  try {
    queue.value = await getWatchlaterQueue()
  } catch (error) {
    logError(error)
    failed.value = true
  } finally {
    loading.value = false
  }
}

const updateQueue = async (applyUpdate: () => Promise<void>) => {
  if (!uid || busy.value) {
    return
  }
  updating.value = true
  actionFailed.value = false
  try {
    await applyUpdate()
  } catch (error) {
    logError(error)
    actionFailed.value = true
  } finally {
    updating.value = false
  }
}
const removeVideo = (aid: number) =>
  updateQueue(async () => {
    const focusedButton = document.activeElement?.closest('.dashboard-home-content-card-watchlater')
    const focusedCard = focusedButton?.closest('.dashboard-home-card-grid-item')
    await removeWatchlater(aid)
    const restoreFocus = focusedCard && document.activeElement === focusedButton
    const adjacentCard = focusedCard?.nextElementSibling ?? focusedCard?.previousElementSibling
    queue.value = queue.value.filter(item => item.aid !== aid)
    await nextTick()
    if (restoreFocus && !focusedCard.isConnected && document.activeElement === document.body) {
      const nextLink = adjacentCard?.querySelector<HTMLAnchorElement>(
        '.dashboard-home-content-card-title > a',
      )
      const nextControl = nextLink ?? watchStatusSelect.value
      nextControl?.focus()
    }
  })
const clearQueue = async (watchedOnly: boolean) => {
  if (
    busy.value ||
    (watchedOnly ? !hasWatched.value : !queue.value.length) ||
    !window.confirm(watchedOnly ? '移除所有已看完的视频？' : '清空整个稍后再看列表？')
  ) {
    return
  }
  await updateQueue(async () => {
    await clearWatchlater(watchedOnly)
    const removed = new Set(
      queue.value.filter(item => !watchedOnly || isWatched(item)).map(item => item.aid),
    )
    queue.value = queue.value.filter(item => !removed.has(item.aid))
    const remaining = watchedOnly ? watchlaterList.filter(aid => !removed.has(aid)) : []
    watchlaterList.splice(0, watchlaterList.length, ...remaining)
  })
}

onMounted(refreshQueue)
</script>
