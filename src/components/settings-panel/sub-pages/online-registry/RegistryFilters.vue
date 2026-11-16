<template>
  <div class="online-registry-filters">
    <div class="online-registry-filter">
      排序
      <VDropdown
        :value="sortOptions.find(item => item.name === selection.sort)"
        :items="sortOptions"
        class="online-registry-sort"
        @change="update('sort', $event.name)"
      />
    </div>
    <div class="online-registry-filter">
      安装状态
      <VDropdown
        :value="statusOptions.find(item => item.name === selection.status)"
        :items="statusOptions"
        @change="update('status', $event.name)"
      />
    </div>
    <div class="online-registry-filter">
      功能类型
      <VDropdown
        :value="typeOptions.find(item => item.name === selection.type)"
        :items="typeOptions"
        @change="update('type', $event.name)"
      />
    </div>
    <div class="online-registry-filter">
      标签
      <VDropdown
        :value="tagOptions.find(item => item.name === selection.tag)"
        :items="tagOptions"
        :disabled="selection.type === 'plugin'"
        @change="update('tag', $event.name)"
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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { VDropdown } from '@/ui'
import type { RegistryFilterSelection, RegistryItemData } from './types'

const props = defineProps<{
  selection: RegistryFilterSelection
  items: RegistryItemData[] | null
}>()
const emit = defineEmits<{ (event: 'change', selection: RegistryFilterSelection): void }>()

const all = { name: '', displayName: '全部' }
const sortOptions = [
  { name: 'default', displayName: '默认顺序' },
  { name: 'nameAsc', displayName: '名称正序' },
  { name: 'nameDesc', displayName: '名称倒序' },
  { name: 'installed', displayName: '已安装优先' },
  { name: 'notInstalled', displayName: '未安装优先' },
]
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
  const tags = lodash.uniqBy(
    props.items?.flatMap(item => item.componentTags) ?? [],
    tag => tag.name,
  )
  return [all, ...lodash.sortBy(tags, tag => tag.order)]
})

const update = <Key extends keyof RegistryFilterSelection>(
  key: Key,
  value: RegistryFilterSelection[Key],
) => {
  const filters = { ...props.selection, [key]: value }
  if (filters.type === 'plugin') {
    filters.tag = ''
  }
  emit('change', filters)
}
</script>

<style lang="scss">
@import 'common';

.online-registry {
  &-filters {
    @include h-center(12px);
    flex-wrap: wrap;
    justify-content: center;
    font-size: 12px;
    white-space: nowrap;
  }
  &-filter {
    @include h-center(6px);
    .be-dropdown {
      width: 90px;
      &.online-registry-sort {
        width: 132px;
      }
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
}
</style>
