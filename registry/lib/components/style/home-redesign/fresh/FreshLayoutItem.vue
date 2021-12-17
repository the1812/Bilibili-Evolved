<template>
  <div
    class="fresh-home-content-layout-item"
    :class="{
      grow: item.grow,
      linebreak: options.linebreak,
    }"
  >
    <component :is="item.component" />
  </div>
</template>
<script lang="ts">
import { getComponentSettings } from '@/core/settings'
import { FreshLayoutItemSettings } from './layouts/fresh-layout-item'

const options = getComponentSettings('freshHome').options as {
  layoutOptions: Record<string, FreshLayoutItemSettings>
}
export default Vue.extend({
  props: {
    item: {
      required: true,
      type: Object,
    },
  },
  data() {
    return {
      options: options.layoutOptions[this.item.name] ?? {},
    }
  },
})
</script>
<style lang="scss">
.fresh-home {
  &-content-layout-item {
    flex: 0 0 auto;
      &.linebreak {
        flex: 1 0 100%;
      }
      &.grow {
        flex: 1 0 0;
      }
  }
}
</style>
