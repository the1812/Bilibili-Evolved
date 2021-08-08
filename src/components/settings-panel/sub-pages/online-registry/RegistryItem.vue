<template>
  <div class="online-registry-item">
    <VIcon
      :size="18"
      :icon="icon"
      class="item-icon"
    />
    <div class="item-badge">
      {{ badge }}
    </div>
    <div class="item-display-name">
      {{ item.displayName }}
    </div>
    <div
      v-if="description"
      class="item-description"
      v-html="description"
    >
    </div>
  </div>
</template>
<script lang="ts">
import { getDescriptionHTML } from '@/components/description'
import {
  VIcon,
} from '@/ui'

const typeMappings = {
  component: {
    icon: 'mdi-cube-scan',
    badge: '组件',
  },
  plugin: {
    icon: 'mdi-puzzle-outline',
    badge: '插件',
  },
  style: {
    icon: 'mdi-tune',
    badge: '样式',
  },
  pack: {
    icon: 'mdi-package-variant-closed',
    badge: '合集包',
  },
}
export default Vue.extend({
  components: { VIcon },
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      typeMappings,
      ...typeMappings[this.item.type],
      description: getDescriptionHTML(this.item),
    }
  },
})
</script>
<style lang="scss">
@import "common";
@import "markdown";

.online-registry-item {
  @include h-center(4px);
  flex-wrap: wrap;
  padding: 8px 0;
  &:not(:last-child) {
    border-bottom: 1px solid #8882;
  }
  .item-badge {
    padding: 2px 4px;
    background-color: #8882;
    border-radius: 4px;
    font-size: 12px;
  }
  .item-display-name {
    font-weight: bold;
  }
  .item-description {
    flex: 1 0 100%;
    transition: opacity .2s ease-out;
    opacity: 0.5;
    font-size: 13px;
    margin-top: 4px;
    @include markdown();
  }
  &:hover .item-description {
    opacity: 1;
  }
}
</style>
