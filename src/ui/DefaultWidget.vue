<template>
  <VButton class="default-widget">
    <div class="widget-icon">
      <slot name="icon">
        <VIcon :type="iconType" :icon="icon"></VIcon>
      </slot>
    </div>
    <div class="widget-name">
      <slot>{{ name }}</slot>
    </div>
  </VButton>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import VIcon from './icon/VIcon.vue'
import VButton from './VButton.vue'

export default defineComponent({
  components: {
    VIcon,
    VButton,
  },
  props: {
    name: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '',
    },
    iconType: {
      type: String,
      default: '',
    },
  },
})
</script>

<style lang="scss" scoped>
@import 'common';
.default-widget {
  position: relative;
  .widget-icon {
    margin-right: 8px;
    opacity: 0.75;
  }
  .widget-name {
    display: flex;
  }
}
</style>
