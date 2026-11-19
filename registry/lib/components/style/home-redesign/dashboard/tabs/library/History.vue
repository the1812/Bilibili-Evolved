<template>
  <div class="dashboard-home-library">
    <VEmpty v-if="!uid">登录后查看历史记录</VEmpty>
    <template v-else>
      <LibraryToolbar :value="keyword" @input="keyword = $event">
        <template #filters>
          <label>
            <span>历史类型</span>
            <select v-model="type">
              <option v-for="filter in navbarFilterTypes" :key="filter.name" :value="filter">
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
        <LibraryPageStatus
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
  navbarFilterTypes,
  type HistoryItem,
} from '../../../../custom-navbar/history/types'
import DashboardHomeOperations from '../../shared/DashboardHomeOperations.vue'
import LibraryCards from './LibraryCards.vue'
import LibraryPageStatus from './LibraryPageStatus.vue'
import LibraryToolbar from './LibraryToolbar.vue'
import { filterLibraryEntries, type LibraryEntry, useLibraryPages } from './library'

const uid = getUID()
const type = ref(navbarFilterTypes[0])
const keyword = ref('')

const toHistoryEntry = (item: HistoryItem): LibraryEntry => {
  const kind = navbarFilterTypes.find(filter => filter.name === item.type)?.displayName
  const progress = item.duration > 0 && item.progress > 0 ? Math.min(item.progress, 1) : undefined
  return {
    id: `${item.type}:${item.id}`,
    title: item.title,
    cover: item.cover,
    url: item.url,
    badge: kind,
    detail: [item.upName, item.timeText, progress === 1 ? '已看完' : undefined]
      .filter(Boolean)
      .join(' · '),
    progress,
  }
}

const { entries, loading, failed, hasMore, loadTarget, loadNext, refresh } =
  useLibraryPages<number>(
    () => (uid ? type.value.name : undefined),
    async viewTime => {
      const items: HistoryItem[] = await getHistoryItems(viewTime, type.value)
      const nextViewTime = items.at(-1)?.viewAt
      return {
        entries: items.map(toHistoryEntry),
        next:
          nextViewTime && (viewTime === undefined || nextViewTime < viewTime)
            ? nextViewTime
            : undefined,
      }
    },
    () => !keyword.value.trim(),
  )
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
