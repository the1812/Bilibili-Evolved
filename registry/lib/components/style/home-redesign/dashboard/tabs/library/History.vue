<template>
  <div class="dashboard-home-library">
    <VEmpty v-if="!uid">登录后查看历史记录</VEmpty>
    <template v-else>
      <LibraryToolbar :value="keyword" @input="keyword = $event">
        <template #filters>
          <label>
            <span>历史类型</span>
            <select v-model="type">
              <option v-for="filter in navbarFilterTypes" :key="filter.name" :value="filter.name">
                {{ filter.displayName }}
              </option>
            </select>
          </label>
        </template>
        <template #actions>
          <a href="https://www.bilibili.com/history" target="_blank" rel="noopener">查看完整历史</a>
        </template>
      </LibraryToolbar>
      <LibraryCards :entries="filteredEntries" />
      <div ref="loadTarget">
        <ListStatus
          :loading="loading"
          :failed="failed"
          :has-more="hasMore"
          :empty="emptyMessage"
          @load="loadNext"
        />
      </div>
      <DashboardHomeOperations :refresh-disabled="loading" @refresh="refresh" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { getUID } from '@/core/utils'
import { VEmpty } from '@/ui'
import {
  getHistoryItems,
  HistoryType,
  navbarFilterTypes,
  type HistoryItem,
} from '../../../../custom-navbar/history/types'
import DashboardHomeOperations from '../../shared/DashboardHomeOperations.vue'
import ListStatus from '../../shared/ListStatus.vue'
import { usePagedList } from '../../shared/use-paged-list'
import LibraryCards from './LibraryCards.vue'
import LibraryToolbar from './LibraryToolbar.vue'
import { filterLibraryEntries, type LibraryEntry } from './library'

const uid = getUID()
const type = ref(HistoryType.All)
const keyword = ref('')

const toHistoryEntry = (item: HistoryItem): LibraryEntry => {
  const kind = navbarFilterTypes.find(filter => filter.name === item.type)?.displayName
  const progress =
    item.duration > 0 && Number.isFinite(item.progress) && item.progress > 0
      ? Math.min(item.progress, 1)
      : undefined
  return {
    id: `${item.type}:${item.id}`,
    title: item.title,
    cover: item.cover,
    url: item.url,
    badge: kind,
    author: item.upName,
    detail: [item.upName, item.timeText, progress === 1 ? '已看完' : undefined]
      .filter(Boolean)
      .join(' · '),
    progress,
  }
}

const { entries, loading, failed, hasMore, loadTarget, loadNext, refresh } = usePagedList<
  LibraryEntry,
  number
>({
  source: () => (uid ? type.value : undefined),
  fetchPage: async viewTime => {
    const selectedType = type.value
    const filter = navbarFilterTypes.find(item => item.name === selectedType)
    // Video and bangumi share an API category. Advance using the unfiltered page.
    const items = await getHistoryItems(viewTime, { ...filter, name: HistoryType.All })
    const nextViewTime = items.at(-1)?.viewAt
    return {
      entries: items
        .filter(item => selectedType === HistoryType.All || item.type === selectedType)
        .map(toHistoryEntry),
      next:
        nextViewTime && (viewTime === undefined || nextViewTime < viewTime)
          ? nextViewTime
          : undefined,
    }
  },
  getKey: item => item.id,
  logName: '仪表盘首页历史',
  autoLoad: () => !keyword.value.trim(),
})
const filteredEntries = computed(() => filterLibraryEntries(entries.value, keyword.value))
const emptyMessage = computed(() => {
  if (filteredEntries.value.length) {
    return ''
  }
  if (keyword.value.trim()) {
    return '已加载内容中没有匹配项'
  }
  return hasMore.value ? '' : '暂无历史记录'
})
</script>
