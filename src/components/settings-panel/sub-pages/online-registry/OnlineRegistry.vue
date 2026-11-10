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
      <RegistryFilters :selection="filters" :items="list" @change="filters = $event" />
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
import { sizeChange } from '@/core/observer'
import { TextBox, VButton, VEmpty, VIcon, VLoading, VPopup } from '@/ui'
import RegistryFilters from './RegistryFilters.vue'
import RegistryItem from './RegistryItem.vue'
import { queryRegistryItems } from './registry-query'
import type { RegistryFilterSelection } from './types'
import { useRegistryData } from './use-registry-data'

const popupOpen = ref(false)
defineExpose({ popupOpen })

const { list, loading, loadFailed, installing, isInstalled, loadFeatures, install } =
  useRegistryData()
const content = ref<HTMLElement>()
const cardColumns = ref(1)
const searchKeyword = ref('')
const appliedKeyword = ref('')
const filters = ref<RegistryFilterSelection>({ sort: 'default', status: '', type: '', tag: '' })

const filteredList = computed(() =>
  queryRegistryItems(list.value ?? [], filters.value, appliedKeyword.value, isInstalled),
)
const scrollToTop = () => content.value?.scrollTo(0, 0)
const applySearch = () => {
  appliedKeyword.value = searchKeyword.value.toLowerCase()
  scrollToTop()
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

watch(searchKeyword, debouncedSearch)
watch(filters, scrollToTop)
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
watch(popupOpen, open => {
  if (open && !loadFailed.value) {
    loadFeatures()
  }
})
onUnmounted(() => debouncedSearch.cancel())
</script>

<style lang="scss">
@import 'common';

.online-registry {
  $inline-padding: 16px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.95);
  width: 50vw;
  height: 85vh;
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
    font-size: 12px;
    @include h-stretch(8px);
    .be-button {
      padding: 4px 12px;
      white-space: nowrap;
    }
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
