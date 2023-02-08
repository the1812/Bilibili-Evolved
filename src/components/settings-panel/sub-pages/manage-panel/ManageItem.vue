<script setup lang="ts">
import { useVirtualScroll } from '@/components/settings-panel/mixins'

const { el, virtual } = useVirtualScroll('.manage-panel .manage-item-list')
</script>

<template>
  <div ref="el" class="manage-item" :class="{ virtual }">
    <slot v-if="!virtual"></slot>
  </div>
</template>

<style lang="scss">
.manage-panel .manage-item {
  flex: 0 0 auto;
  min-height: 30px;
  width: 100%;
  box-sizing: border-box;
  // padding: 8px;

  // &:not(.virtual) {
  //   border-radius: 8px;
  //   border: 1px solid #8882;
  // }
  // &:not(:last-child) {
  //   margin-bottom: 8px;
  // }
}
</style>
