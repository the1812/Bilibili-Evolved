<template>
  <div class="manage-item" :class="{ virtual }">
    <slot v-if="!virtual"></slot>
  </div>
</template>
<script lang="ts">
import { virtualScrollMixin } from '../../mixins'

export default Vue.extend({
  mixins: [virtualScrollMixin('.manage-panel .manage-item-list')],
})
</script>
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
