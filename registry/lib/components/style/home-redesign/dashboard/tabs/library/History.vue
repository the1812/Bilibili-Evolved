<template>
  <div class="dashboard-home-card-view dashboard-home-library">
    <VEmpty v-if="!uid">登录后查看历史记录</VEmpty>
    <template v-else>
      <LibraryToolbar :value="keyword" @input="keyword = $event">
        <template #filters>
          <label>
            <span>历史类型</span>
            <select v-model="historyType">
              <option v-for="filter in navbarFilterTypes" :key="filter.name" :value="filter.name">
                {{ filter.displayName }}
              </option>
            </select>
          </label>
        </template>
        <template #actions>
          <button
            type="button"
            class="dashboard-home-history-recording-toggle"
            :title="recordingAction.label"
            :aria-label="recordingAction.label"
            :aria-disabled="recordingBusy ? 'true' : undefined"
            @click="toggleRecording"
          >
            <VIcon :icon="recordingAction.icon" :size="14" aria-hidden="true" />
          </button>
          <a href="https://www.bilibili.com/history" target="_blank" rel="noopener">查看完整历史</a>
        </template>
      </LibraryToolbar>
      <CardCollection>
        <LibraryCards :entries="filteredEntries" />
        <ListStatus
          ref="loadTarget"
          class="dashboard-home-card-list-end"
          :loading="loading"
          :failed="failed"
          :has-more="hasMore"
          :empty="emptyMessage"
          @load="loadNext"
        />
      </CardCollection>
      <DashboardHomeOperations :refresh-disabled="loading" @refresh="refreshHistory" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { getUID } from '@/core/utils'
import { VEmpty, VIcon } from '@/ui'
import { HistoryType, navbarFilterTypes } from '../../../../custom-navbar/history/types'
import CardCollection from '../../shared/CardCollection.vue'
import DashboardHomeOperations from '../../shared/DashboardHomeOperations.vue'
import ListStatus from '../../shared/ListStatus.vue'
import { usePagedList } from '../../shared/use-paged-list'
import { getHistoryPage } from './history-api'
import LibraryCards from './LibraryCards.vue'
import LibraryToolbar from './LibraryToolbar.vue'
import { filterLibraryEntries, getLibraryEmptyMessage, type LibraryEntry } from './library'
import { useHistoryRecording } from './use-history-recording'

const uid = getUID()
const historyType = ref(HistoryType.All)
const keyword = ref('')
const {
  action: recordingAction,
  busy: recordingBusy,
  refreshRecording,
  toggleRecording,
} = useHistoryRecording(uid)
const {
  entries,
  loading,
  failed,
  hasMore,
  loadTarget,
  loadNext,
  refresh: refreshEntries,
} = usePagedList<LibraryEntry, string>({
  source: () => (uid ? historyType.value : undefined),
  fetchPage: cursor => getHistoryPage(historyType.value, cursor),
  getKey: item => item.id,
  logName: '仪表盘首页历史',
  autoLoad: () => !keyword.value.trim(),
})
const filteredEntries = computed(() => filterLibraryEntries(entries.value, keyword.value))
const emptyMessage = computed(() =>
  getLibraryEmptyMessage({
    entries: entries.value,
    matches: filteredEntries.value,
    filtering: Boolean(keyword.value.trim()),
    hasMore: hasMore.value,
    empty: '暂无历史记录',
  }),
)

const refreshHistory = () => {
  refreshEntries()
  refreshRecording()
}
</script>
