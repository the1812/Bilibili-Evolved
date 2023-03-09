<template>
  <div
    class="fresh-home-content-layout-item"
    :class="{
      grow: item.grow,
    }"
  >
    <component :is="markRaw(item.component)" />
  </div>
  <div v-if="options.linebreak" class="fresh-home-content-layout-item linebreak"></div>
</template>
<script lang="ts">
import type { PropType } from 'vue'
import { defineComponent, markRaw } from 'vue'
import { freshHomeOptions } from './types'
import type { FreshLayoutItem } from './layouts/fresh-layout-item'

export default defineComponent({
  props: {
    item: {
      required: true,
      type: Object as PropType<FreshLayoutItem>,
    },
  },
  setup: () => ({ markRaw }),
  data() {
    return {
      options: freshHomeOptions.layoutOptions[this.item.name] ?? { linebreak: false },
    }
  },
})
</script>
<style lang="scss">
.fresh-home {
  &-content-layout-item {
    flex: 0 0 auto;
    padding: 12px;
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
