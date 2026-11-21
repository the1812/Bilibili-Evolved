<template>
  <div class="dashboard-home-card-view dashboard-home-library">
    <VEmpty v-if="!uid">登录后查看收藏</VEmpty>
    <template v-else>
      <LibraryToolbar :value="keyword" @input="keyword = $event">
        <template #filters>
          <label>
            <span>收藏类型</span>
            <select v-model="kind">
              <option v-for="(label, value) in favoriteKinds" :key="value" :value="value">
                {{ label }}
              </option>
            </select>
          </label>
          <label v-if="kind === 'folders' && folders.length">
            <span>收藏夹</span>
            <select v-model="folder">
              <option v-for="item in folders" :key="item.id" :value="item.id">
                {{ item.title }}（{{ item.media_count }}）
              </option>
            </select>
          </label>
          <label v-if="isFollowing">
            <span>观看状态</span>
            <select v-model.number="status">
              <option v-for="(label, value) in followStatuses" :key="value" :value="value">
                {{ label }}
              </option>
            </select>
          </label>
        </template>
        <template v-if="kind === 'folders' && folder" #actions>
          <a :href="`https://www.bilibili.com/list/ml${folder}`" target="_blank" rel="noopener">
            播放全部
          </a>
        </template>
      </LibraryToolbar>
      <CardCollection>
        <LibraryCards :entries="filteredEntries" />
        <div ref="loadTarget" class="dashboard-home-card-end">
          <ListStatus
            :loading="busy"
            :failed="failed || (kind === 'folders' && foldersFailed)"
            :has-more="hasMore"
            :empty="emptyMessage"
            @load="retryOrLoad"
          />
        </div>
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
const kind = ref<keyof typeof favoriteKinds>('folders')
const keyword = ref('')
const status = ref(0)
const folder = ref<number>()
const folders = ref<FavoriteFolder[]>([])
const foldersLoading = ref(false)
const foldersFailed = ref(false)
let foldersLoaded = false
const isFollowing = computed(() => kind.value === 'bangumi' || kind.value === 'cinema')

const loadFolders = async () => {
  if (!uid || foldersLoading.value) {
    return
  }
  foldersLoading.value = true
  foldersFailed.value = false
  try {
    folders.value = await getFavoriteFolders(uid)
    if (!folders.value.some(item => item.id === folder.value)) {
      folder.value = folders.value[0]?.id
    }
    foldersLoaded = true
  } catch (error) {
    logError(error)
    foldersFailed.value = true
  } finally {
    foldersLoading.value = false
  }
}

const source = () => {
  if (!uid) {
    return undefined
  }
  if (kind.value === 'folders') {
    return folder.value ? `folders:${folder.value}` : undefined
  }
  return isFollowing.value ? `${kind.value}:${status.value}` : kind.value
}
const { entries, loading, failed, hasMore, loadTarget, loadNext, refresh } = usePagedList<
  LibraryEntry,
  number
>({
  source,
  fetchPage: (page = 1) => {
    switch (kind.value) {
      case 'folders':
        return getFavoriteMedia(folder.value, page)
      case 'collections':
        return getCollectedFolders(uid, page)
      default:
        return getFollowedShows(uid, kind.value, status.value, page)
    }
  },
  getKey: item => item.id,
  logName: '仪表盘首页收藏',
  autoLoad: () => !keyword.value.trim(),
})
const busy = computed(() => loading.value || (kind.value === 'folders' && foldersLoading.value))
const filteredEntries = computed(() => filterLibraryEntries(entries.value, keyword.value))
const emptyMessage = computed(() =>
  getLibraryEmptyMessage({
    entries: entries.value,
    matches: filteredEntries.value,
    filtering: Boolean(keyword.value.trim()),
    hasMore: hasMore.value,
    empty: kind.value === 'folders' && !folder.value ? '暂无收藏夹' : '暂无收藏内容',
  }),
)

watch(
  kind,
  value => {
    if (value === 'folders' && !foldersLoaded) {
      loadFolders()
    }
  },
  { immediate: true },
)

const retryOrLoad = () => {
  if (kind.value === 'folders' && foldersFailed.value) {
    return loadFolders()
  }
  return loadNext()
}

const refreshFavorites = async () => {
  if (kind.value === 'folders') {
    const previous = folder.value
    await loadFolders()
    if (kind.value !== 'folders' || foldersFailed.value || previous !== folder.value) {
      return
    }
  }
  await refresh()
}
</script>
