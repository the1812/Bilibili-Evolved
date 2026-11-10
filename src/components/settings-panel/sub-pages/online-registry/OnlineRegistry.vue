<template>
  <VPopup
    v-model="popupOpen"
    class="online-registry be-settings-extra-options"
    fixed
    :auto-close="false"
  >
    <div class="online-registry-header">
      <div class="online-registry-title">
        <VIcon icon="mdi-web" />
        在线仓库
      </div>
      <div class="online-registry-search">
        <TextBox v-model="searchKeyword" placeholder="搜索功能" @keydown.enter="onSearchEnter" />
        <VButton type="primary" :disabled="loading" @click="search">搜索</VButton>
      </div>
      <VIcon
        icon="mdi-close"
        :size="24"
        class="online-registry-close"
        title="关闭"
        @click="popupOpen = false"
      />
    </div>
    <div class="online-registry-toolbar">
      <div class="online-registry-filters">
        <div class="online-registry-filter">
          安装状态
          <VDropdown v-model="selectedStatus" :items="statusOptions" />
        </div>
        <div class="online-registry-filter">
          功能类型
          <VDropdown v-model="selectedType" :items="typeOptions" />
        </div>
        <div class="online-registry-filter">
          标签
          <VDropdown
            v-model="selectedTag"
            :items="tagOptions"
            :disabled="selectedType.name === 'plugin'"
          >
            <template #item="{ item }">
              <span class="online-registry-tag-option">
                <span
                  v-if="item.color"
                  class="online-registry-tag-dot"
                  :style="{ '--tag-color': item.color }"
                ></span>
                {{ item.displayName }}
              </span>
            </template>
          </VDropdown>
        </div>
      </div>
    </div>
    <div ref="content" class="online-registry-content">
      <VLoading v-if="loading" />
      <div v-else-if="loadFailed" class="online-registry-error">
        加载在线仓库失败，请点击搜索重试
      </div>
      <VEmpty v-else-if="!filteredList.length" />
      <div v-else class="online-registry-grid" :style="{ '--card-columns': cardColumns }">
        <RegistryItem
          v-for="item of filteredList"
          :key="item.type + ':' + item.name"
          :item="item"
          :installed="isInstalled(item)"
          :installing="installing.includes(item)"
          @install="install(item)"
        />
      </div>
    </div>
  </VPopup>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import type { DocSourceItem } from '../../../../../registry/lib/docs'
import { componentsTags } from '@/components/types'
import { getDescriptionText } from '@/components/description'
import { monkey } from '@/core/ajax'
import { getCdnConfig } from '@/core/cdn-types'
import { installFeature } from '@/core/install-feature'
import { branches, meta } from '@/core/meta'
import { sizeChange } from '@/core/observer'
import {
  addSettingsChangeListener,
  getGeneralSettings,
  removeSettingsChangeListener,
  settings,
} from '@/core/settings'
import { logError } from '@/core/utils/log'
import { TextBox, VButton, VDropdown, VEmpty, VIcon, VLoading, VPopup } from '@/ui'
import RegistryItem from './RegistryItem.vue'
import type { RegistryItemData } from './types'

const popupOpen = ref(false)
defineExpose({ popupOpen })

const general = getGeneralSettings()
const branch = [branches.preview, 'preview-features'].includes(meta.compilationInfo.branch)
  ? branches.preview
  : branches.stable

const loading = ref(false)
const loadFailed = ref(false)
const list = ref<RegistryItemData[] | null>(null)
const installing = ref<RegistryItemData[]>([])
const content = ref<HTMLElement>()
const cardColumns = ref(1)
const searchKeyword = ref('')
const appliedKeyword = ref('')

const all = { name: '', displayName: '全部' }
const statusOptions = [
  all,
  { name: 'installed', displayName: '已安装' },
  { name: 'notInstalled', displayName: '未安装' },
]
const typeOptions = [
  all,
  { name: 'component', displayName: '组件' },
  { name: 'plugin', displayName: '插件' },
]
const tagOptions = computed(() => {
  const tags = lodash.uniqBy(list.value?.flatMap(item => item.componentTags) ?? [], tag => tag.name)
  return [all, ...lodash.sortBy(tags, tag => tag.order)]
})
const selectedStatus = ref(all)
const selectedType = ref(all)
const selectedTag = ref(all)

const readInstalled = () => ({
  component: new Set(Object.keys(settings.userComponents)),
  plugin: new Set(Object.keys(settings.userPlugins)),
})
const installed = ref(readInstalled())
const isInstalled = (item: RegistryItemData) => installed.value[item.type].has(item.name)
const refreshInstalled = () => {
  installed.value = readInstalled()
}
addSettingsChangeListener('userComponents', refreshInstalled)
addSettingsChangeListener('userPlugins', refreshInstalled)

const filteredList = computed(() => {
  const status = selectedStatus.value.name
  const type = selectedType.value.name
  const tag = selectedTag.value.name
  const keyword = appliedKeyword.value
  return (list.value ?? []).filter(
    item =>
      (!status || isInstalled(item) === (status === 'installed')) &&
      (!type || item.type === type) &&
      (!tag || item.componentTags.some(itemTag => itemTag.name === tag)) &&
      (!keyword || item.searchText.includes(keyword)),
  )
})

const loadFeatures = async () => {
  if (loading.value || list.value) {
    return
  }
  loading.value = true
  loadFailed.value = false
  try {
    const cdn = getCdnConfig(general.cdnRoot)
    const url =
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:23333/dev/online-registry/features.json'
        : `${cdn.root(branch, cdn.repo)}doc/features/features.json`
    const entries = await monkey<DocSourceItem[]>({ url, responseType: 'json' })
    if (!Array.isArray(entries)) {
      throw new Error(`无效的在线仓库索引: ${url}`)
    }
    list.value = await Promise.all(
      entries.map(async item => {
        const descriptionText = await getDescriptionText(item)
        return {
          ...item,
          repo: item.repo ?? (item.owner ? `${item.owner}/Bilibili-Evolved` : cdn.repo),
          componentTags:
            item.type === 'component'
              ? (item.tags ?? []).map(tag => componentsTags[tag]).filter(Boolean)
              : [],
          descriptionText,
          searchText: [item.name, item.displayName, descriptionText].join('\n').toLowerCase(),
        }
      }),
    )
  } catch (error) {
    loadFailed.value = true
    console.error('获取在线仓库索引失败', error)
  } finally {
    loading.value = false
  }
}

const applySearch = () => {
  appliedKeyword.value = searchKeyword.value.toLowerCase()
  content.value?.scrollTo(0, 0)
}
const debouncedSearch = lodash.debounce(applySearch, 200)
const search = () => {
  debouncedSearch.cancel()
  applySearch()
  loadFeatures()
}
const onSearchEnter = (event: KeyboardEvent) => {
  if (!event.isComposing) {
    search()
  }
}

const install = async (item: RegistryItemData) => {
  if (installing.value.includes(item)) {
    return
  }
  installing.value.push(item)
  try {
    await installFeature({
      kind: 'github',
      repo: item.repo,
      ref: branch,
      path: item.fullAbsolutePath,
      cdn: general.cdnRoot,
    })
  } catch (error) {
    logError(error)
  } finally {
    installing.value = installing.value.filter(entry => entry !== item)
  }
}

watch(searchKeyword, debouncedSearch)
watch(content, (element, _, onCleanup) => {
  if (!element) {
    return
  }
  const gap = parseFloat(getComputedStyle(element).getPropertyValue('--card-gap'))
  const maxCardWidth = 256
  const [observer] = sizeChange(element, ([{ contentRect }]) => {
    cardColumns.value = Math.ceil((contentRect.width + gap) / (maxCardWidth + gap))
  })
  onCleanup(() => observer.disconnect())
})
watch(selectedType, type => {
  if (type.name === 'plugin') {
    selectedTag.value = all
  }
})
watch([selectedStatus, selectedType, selectedTag], () => content.value?.scrollTo(0, 0))
watch(popupOpen, open => {
  if (open && !loadFailed.value) {
    loadFeatures()
  }
})
onUnmounted(() => {
  debouncedSearch.cancel()
  removeSettingsChangeListener('userComponents', refreshInstalled)
  removeSettingsChangeListener('userPlugins', refreshInstalled)
})
</script>

<style lang="scss">
@import 'common';

.online-registry {
  $inline-padding: 16px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.95);
  width: 64vw;
  height: 64vh;
  z-index: 100000;
  transition: 0.2s ease-out;
  font-size: 14px;
  @include v-stretch();
  @include popup();
  &.open {
    transform: translate(-50%, -50%) scale(1);
  }
  &-header {
    padding: 12px $inline-padding;
    flex-shrink: 0;
    display: grid;
    grid-template-columns: minmax(110px, 1fr) minmax(0, 400px) minmax(110px, 1fr);
    align-items: center;
    gap: 8px;
  }
  &-title {
    font-size: 18px;
    white-space: nowrap;
    @include h-center(8px);
    @include semi-bold();
  }
  &-close {
    justify-self: end;
    padding: 2px;
    cursor: pointer;
    &:hover {
      color: var(--theme-color);
    }
  }
  &-toolbar {
    padding: 0 $inline-padding 12px;
    flex-shrink: 0;
    border-bottom: 1px solid #8882;
  }
  &-search {
    min-width: 0;
    @include h-stretch(8px);
    .be-button {
      padding: 4px 12px;
      white-space: nowrap;
    }
  }
  &-filters {
    @include h-center(12px);
    flex-wrap: wrap;
    justify-content: center;
    white-space: nowrap;
  }
  &-filter {
    @include h-center(6px);
    .be-dropdown {
      width: 90px;
    }
  }
  &-tag-option {
    @include h-center(6px);
  }
  &-tag-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--tag-color);
  }
  &-content {
    --card-gap: 12px;
    flex: 1;
    min-height: 0;
    padding: 16px $inline-padding;
    @include no-scrollbar();
  }
  &-grid {
    display: grid;
    grid-template-columns: repeat(var(--card-columns), minmax(0, 1fr));
    gap: var(--card-gap);
  }
  &-error {
    text-align: center;
  }
}
</style>
