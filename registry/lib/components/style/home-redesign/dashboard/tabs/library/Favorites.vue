<template>
  <div class="dashboard-home-card-view dashboard-home-library">
    <VEmpty v-if="!uid">登录后查看收藏</VEmpty>
    <template v-else>
      <LibraryToolbar :value="keyword" @input="keyword = $event">
        <template #filters>
          <label>
            <span>收藏类型</span>
            <select v-model="favoriteKind">
              <option v-for="(label, value) in favoriteKinds" :key="value" :value="value">
                {{ label }}
              </option>
            </select>
          </label>
          <label v-if="favoriteKind === 'folders' && folders.length">
            <span>收藏夹</span>
            <select v-model="selectedFolderId">
              <option v-for="item in folders" :key="item.id" :value="item.id">
                {{ item.title }}（{{ item.media_count }}）
              </option>
            </select>
          </label>
          <label v-if="isFollowedShowKind">
            <span>观看状态</span>
            <select v-model.number="followStatus">
              <option v-for="(label, value) in followStatuses" :key="value" :value="value">
                {{ label }}
              </option>
            </select>
          </label>
        </template>
        <template v-if="favoriteKind === 'folders' && selectedFolderId" #actions>
          <a
            :href="`https://www.bilibili.com/list/ml${selectedFolderId}`"
            target="_blank"
            rel="noopener"
          >
            播放全部
          </a>
        </template>
      </LibraryToolbar>
      <CardCollection>
        <LibraryCards :entries="filteredEntries" />
        <ListStatus
          ref="loadTarget"
          class="dashboard-home-card-list-end"
          :loading="busy"
          :failed="failed || (favoriteKind === 'folders' && foldersFailed)"
          :has-more="hasMore"
          :empty="emptyMessage"
          @load="loadMoreFavorites"
        />
      </CardCollection>
      <DashboardHomeOperations :refresh-disabled="busy" @refresh="refreshFavorites" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { getUID } from '@/core/utils'
import { useScopedConsole } from '@/core/utils/log'
import { VEmpty } from '@/ui'
import CardCollection from '../../shared/CardCollection.vue'
import DashboardHomeOperations from '../../shared/DashboardHomeOperations.vue'
import ListStatus from '../../shared/ListStatus.vue'
import { usePagedList } from '../../shared/use-paged-list'
import LibraryCards from './LibraryCards.vue'
import LibraryToolbar from './LibraryToolbar.vue'
import {
  favoriteKinds,
  followStatuses,
  getCollectedFolders,
  getFavoriteFolders,
  getFavoriteMedia,
  getFollowedShows,
  type FavoriteFolder,
} from './favorites-api'
import { filterLibraryEntries, getLibraryEmptyMessage, type LibraryEntry } from './library'

const uid = getUID()
const { error: logError } = useScopedConsole('仪表盘首页收藏')
const favoriteKind = ref<keyof typeof favoriteKinds>('folders')
const keyword = ref('')
const followStatus = ref(0)
const selectedFolderId = ref<number>()
const folders = ref<FavoriteFolder[]>([])
const foldersLoading = ref(false)
const foldersFailed = ref(false)
let hasLoadedFolders = false
const isFollowedShowKind = computed(
  () => favoriteKind.value === 'bangumi' || favoriteKind.value === 'cinema',
)

const getSourceKey = () => {
  if (!uid) {
    return undefined
  }
  const kind = favoriteKind.value
  if (kind === 'folders') {
    return selectedFolderId.value ? `folders:${selectedFolderId.value}` : undefined
  }
  if (kind === 'collections') {
    return kind
  }
  // The pagination source is watched synchronously, before derived values can update.
  return `${kind}:${followStatus.value}`
}
const { entries, loading, failed, hasMore, loadTarget, loadNext, refresh } = usePagedList<
  LibraryEntry,
  number
>({
  source: getSourceKey,
  fetchPage: (page = 1) => {
    switch (favoriteKind.value) {
      case 'folders':
        return getFavoriteMedia(selectedFolderId.value, page)
      case 'collections':
        return getCollectedFolders(uid, page)
      default:
        return getFollowedShows(uid, favoriteKind.value, followStatus.value, page)
    }
  },
  getKey: item => item.id,
  logName: '仪表盘首页收藏',
  autoLoad: () => !keyword.value.trim(),
})
const busy = computed(
  () => loading.value || (favoriteKind.value === 'folders' && foldersLoading.value),
)
const filteredEntries = computed(() => filterLibraryEntries(entries.value, keyword.value))
const emptyMessage = computed(() =>
  getLibraryEmptyMessage({
    entries: entries.value,
    matches: filteredEntries.value,
    filtering: Boolean(keyword.value.trim()),
    hasMore: hasMore.value,
    empty:
      favoriteKind.value === 'folders' && !selectedFolderId.value ? '暂无收藏夹' : '暂无收藏内容',
  }),
)

const loadFolders = async () => {
  if (!uid || foldersLoading.value) {
    return
  }
  foldersLoading.value = true
  foldersFailed.value = false
  try {
    folders.value = await getFavoriteFolders(uid)
    if (!folders.value.some(item => item.id === selectedFolderId.value)) {
      selectedFolderId.value = folders.value[0]?.id
    }
    hasLoadedFolders = true
  } catch (error) {
    logError(error)
    foldersFailed.value = true
  } finally {
    foldersLoading.value = false
  }
}

const refreshFavorites = async () => {
  if (favoriteKind.value === 'folders') {
    const previousFolderId = selectedFolderId.value
    await loadFolders()
    if (
      favoriteKind.value !== 'folders' ||
      foldersFailed.value ||
      previousFolderId !== selectedFolderId.value
    ) {
      return
    }
  }
  await refresh()
}

const loadMoreFavorites = () =>
  favoriteKind.value === 'folders' && foldersFailed.value ? refreshFavorites() : loadNext()

watch(
  favoriteKind,
  value => {
    if (value === 'folders' && !hasLoadedFolders) {
      loadFolders()
    }
  },
  { immediate: true },
)
</script>
