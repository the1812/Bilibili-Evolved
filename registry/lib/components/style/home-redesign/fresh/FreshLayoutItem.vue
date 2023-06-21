<template>
  <div
    class="fresh-home-content-layout-item-container"
    :class="{ 'fresh-home-content-layout-item-hidden': options.hidden }"
  >
    <div
      class="fresh-home-content-layout-item"
      :class="{
        grow: item.grow,
      }"
      :style="{ order: options.order }"
    >
      <component :is="item.component" />
    </div>
    <div
      v-if="options.linebreak"
      class="fresh-home-content-layout-item linebreak"
      :style="{ order: options.order }"
    ></div>
  </div>
</template>
<script lang="ts">
import type { PropType } from 'vue'
import { defineComponent } from 'vue'
import { freshHomeOptions } from './options'
import type { FreshLayoutItem, FreshLayoutItemSettings } from './layouts/fresh-layout-item'

export default defineComponent({
  props: {
    item: {
      required: true,
      type: Object as PropType<FreshLayoutItem>,
    },
  },
  data() {
    return {
      options: (freshHomeOptions.layoutOptions[this.item.name] ?? {
        linebreak: false,
      }) as FreshLayoutItemSettings | { linebreak: boolean; order?: number; hidden?: boolean },
    }
  },
})
</script>
<style lang="scss">
.fresh-home {
  &-content-layout-item {
    flex: 0 0 auto;
    padding: 12px;
    &-container {
      display: contents;
      &.fresh-home-content-layout-item-hidden {
        display: none;
      }
    }
    &.linebreak {
      padding: 0;
      flex: 1 0 100%;
    }
    &.grow {
      flex: 1 0 0;
    }
  }
}
</style>
