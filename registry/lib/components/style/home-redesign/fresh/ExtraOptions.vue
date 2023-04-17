<template>
  <div class="fresh-home-extra-options">
    <div class="fresh-home-extra-options-title">布局配置</div>
    <VLoading v-if="!loaded" />
    <div v-show="loaded" ref="sortList" class="fresh-home-extra-options-sort-list">
      <div
        v-for="item of sortItems"
        :key="item.layoutItem.name"
        class="fresh-home-extra-options-sort-item-container"
      >
        <div
          :data-name="item.layoutItem.name"
          :style="{ 'flex-grow': item.layoutItem.grow ? '1' : '0' }"
          class="fresh-home-extra-options-sort-item"
        >
          <div class="fresh-home-extra-options-sort-item-name">
            <VIcon v-if="item.layoutItem.grow" icon="mdi-arrow-expand-horizontal" :size="16" />
            <VIcon v-else icon="mdi-arrow-collapse-horizontal" :size="16" />
            {{ item.layoutItem.displayName }}
          </div>
          <div class="fresh-home-extra-options-sort-item-config">
            <VButton
              icon
              round
              @click="item.layoutSettings.linebreak = !item.layoutSettings.linebreak"
            >
              <VIcon v-if="item.layoutSettings.linebreak" icon="mdi-wrap" :size="16" />
              <VIcon v-else icon="mdi-wrap-disabled" :size="16" />
            </VButton>
          </div>
        </div>
        <div
          v-if="item.layoutSettings.linebreak"
          class="fresh-home-extra-options-sort-item-linebreak"
        ></div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import type { SortableEvent } from 'sortablejs'
import { SortableJSLibrary } from '@/core/runtime-library'
import { ascendingSort } from '@/core/utils/sort'
import { VLoading, VIcon, VButton } from '@/ui'
import { FreshLayoutItem, FreshLayoutItemSettings } from './layouts/fresh-layout-item'
import { layouts } from './layouts/layouts'
import { freshHomeOptions } from './options'

interface SortItem {
  layoutItem: FreshLayoutItem
  layoutSettings: FreshLayoutItemSettings
}

export default Vue.extend({
  components: { VLoading, VIcon, VButton },
  data() {
    return {
      loaded: false,
      layouts,
    }
  },
  computed: {
    sortItems() {
      return (this.layouts as FreshLayoutItem[])
        .map((layoutItem, index): SortItem => {
          const layoutSettings: FreshLayoutItemSettings = {
            linebreak: false,
            order: index + 1,
            ...freshHomeOptions.layoutOptions[layoutItem.name],
          }
          return {
            layoutItem,
            layoutSettings,
          }
        })
        .filter(it => it !== null)
        .sort(ascendingSort(it => it.layoutSettings.order))
    },
  },
  async mounted() {
    const list: HTMLElement = this.$refs.sortList
    const Sortable = await SortableJSLibrary
    console.log({ list })
    Sortable.create(list, {
      delay: 100,
      forceFallback: true,
      onEnd: (e: SortableEvent) => {
        console.log(e)
      },
    })
    this.loaded = true
  },
})
</script>
<style lang="scss">
@import 'common';

.fresh-home-extra-options {
  @include v-stretch(10px);
  padding: 4px 0;
  &-sort-list {
    @include h-stretch();
    column-gap: 8px;
    row-gap: 4px;
    flex-wrap: wrap;
  }
  &-sort-item-container {
    display: contents;
  }
  &-sort-item {
    @include v-center(6px);
    @include border-card();
    padding: 8px;
    transition: border-color 0.2s ease-out;
    body.dark &:hover,
    &:hover {
      border-color: var(--theme-color);
      cursor: move;
    }
    &-name {
      @include h-center(4px);
    }
    &-linebreak {
      flex: 1 0 100%;
    }
  }
}
</style>
