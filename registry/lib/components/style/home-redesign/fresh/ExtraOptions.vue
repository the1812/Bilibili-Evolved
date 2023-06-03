<template>
  <div class="fresh-home-extra-options">
    <div class="fresh-home-extra-options-title">布局配置</div>
    <VLoading v-if="!loaded" />
    <div v-if="loaded" class="fresh-home-extra-options-tips">
      <div class="fresh-home-extra-options-tip">
        按住并拖动可以调整顺序, 打开换行后下一个元素将会另起一行.
      </div>
      <div class="fresh-home-extra-options-legends">
        <div class="fresh-home-extra-options-legend">
          <VIcon icon="mdi-arrow-expand-horizontal" :size="16" />
          <div class="fresh-home-extra-options-legend-text">可变宽度</div>
        </div>
        <div class="fresh-home-extra-options-legend">
          <VIcon icon="mdi-arrow-collapse-horizontal" :size="16" />
          <div class="fresh-home-extra-options-legend-text">固定宽度</div>
        </div>
        <div class="fresh-home-extra-options-legend">
          <VIcon icon="mdi-wrap" :size="16" />
          <div class="fresh-home-extra-options-legend-text">切换换行</div>
        </div>
        <div class="fresh-home-extra-options-legend">
          <VIcon icon="mdi-eye-outline" :size="16" />
          <div class="fresh-home-extra-options-legend-text">切换显示</div>
        </div>
      </div>
    </div>
    <div v-show="loaded" ref="sortList" class="fresh-home-extra-options-sort-list">
      <div
        v-for="item of sortedItems"
        :key="item.layoutItem.name"
        :data-name="item.layoutItem.name"
        class="fresh-home-extra-options-sort-item"
        :class="{ 'fresh-home-extra-options-sort-item-dimmed': item.layoutSettings.hidden }"
      >
        <VIcon
          v-if="item.layoutItem.grow"
          title="可变宽度"
          icon="mdi-arrow-expand-horizontal"
          class="fresh-home-extra-options-sort-item-type"
          :size="16"
        />
        <VIcon
          v-else
          icon="mdi-arrow-collapse-horizontal"
          class="fresh-home-extra-options-sort-item-type"
          title="固定宽度"
          :size="16"
        />
        <div class="fresh-home-extra-options-sort-item-name">{{ item.layoutItem.displayName }}</div>
        <div class="fresh-home-extra-options-sort-item-actions">
          <VButton
            type="transparent"
            title="切换换行"
            icon
            @click="toggleLinebreak(item.layoutItem)"
          >
            <VIcon v-if="item.layoutSettings.linebreak" icon="mdi-wrap" :size="16" />
            <VIcon v-else icon="mdi-wrap-disabled" :size="16" />
          </VButton>
          <VButton type="transparent" title="切换显示" icon @click="toggleVisible(item.layoutItem)">
            <VIcon v-if="item.layoutSettings.hidden" icon="mdi-eye-off-outline" :size="16" />
            <VIcon v-else icon="mdi-eye-outline" :size="16" />
          </VButton>
        </div>
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
      sortedItems: [],
    }
  },
  async mounted() {
    const list: HTMLElement = this.$refs.sortList
    const Sortable = await SortableJSLibrary
    console.log({ list })
    Sortable.create(list, {
      delay: 100,
      forceFallback: true,
      onEnd: (e: SortableEvent) => {
        const sortedItems = [...this.sortedItems] as SortItem[]
        const [targetItem] = sortedItems.splice(e.oldIndex, 1)
        console.log(targetItem.layoutItem.name, `${e.oldIndex} -> ${e.newIndex}`)
        sortedItems.splice(e.newIndex, 0, targetItem)
        const { layoutOptions } = freshHomeOptions
        sortedItems.forEach((it, index) => {
          ;(layoutOptions[it.layoutItem.name] as FreshLayoutItemSettings).order = index + 1
          it.layoutSettings.order = index + 1
        })
        this.sortedItems = sortedItems
      },
    })
    this.sortItems()
    this.loaded = true
  },
  methods: {
    sortItems() {
      this.sortedItems = (this.layouts as FreshLayoutItem[])
        .map((layoutItem, index): SortItem => {
          const layoutSettings: FreshLayoutItemSettings = {
            linebreak: false,
            order: index + 1,
            hidden: false,
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
    toggleLinebreak(item: FreshLayoutItem) {
      const options = freshHomeOptions.layoutOptions[item.name]
      options.linebreak = !options.linebreak
      this.sortItems()
    },
    toggleVisible(item: FreshLayoutItem) {
      const options = freshHomeOptions.layoutOptions[item.name]
      options.hidden = !options.hidden
      this.sortItems()
    },
  },
})
</script>
<style lang="scss">
@import 'common';

.fresh-home-extra-options {
  @include v-stretch(10px);
  padding: 4px 0;

  &-tips {
    @include v-stretch(4px);
  }
  &-tip {
    opacity: 0.6;
  }
  &-legends {
    @include h-center();
    column-gap: 6px;
    row-gap: 2px;
    flex-wrap: wrap;
  }
  &-legend {
    @include h-center(4px);
  }
  .mdi-arrow-expand-horizontal {
    &,
    & ~ .fresh-home-extra-options-legend-text {
      color: #a875ff;
    }
  }
  .mdi-arrow-collapse-horizontal {
    &,
    & ~ .fresh-home-extra-options-legend-text {
      color: #009fd9;
    }
  }
  &-sort-list {
    @include h-stretch();
    gap: 6px;
    flex-wrap: wrap;
  }
  &-sort-item {
    @include h-center(4px);
    @include border-card();
    @include shadow();
    padding: 2px 4px 2px 8px;
    transition: border-color 0.2s ease-out;
    body.dark &:hover,
    &:hover {
      border-color: var(--theme-color);
      cursor: move;
    }
    &-dimmed {
      opacity: 0.5;
    }
    &-actions {
      @include h-center();
      flex-grow: 1;
      justify-content: flex-end;
    }
  }
}
</style>
