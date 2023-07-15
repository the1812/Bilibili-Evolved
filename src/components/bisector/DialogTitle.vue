<template>
  <div>
    组件二等分
    <div
      class="peek"
      title="透视"
      style="margin-left: auto"
      @mouseover="peek = true"
      @mouseout="peek = false"
    >
      <VIcon icon="eye" :size="18" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { VIcon } from '@/ui'

export default Vue.extend({
  components: { VIcon },
  data() {
    return { peek: false }
  },
  watch: {
    peek(value) {
      this.$el.closest('.be-dialog').style.opacity = value ? '0.1' : '1'
    },
  },
})
</script>

<style lang="scss" scoped>
@import 'common';

div {
  @include h-center(8px);
}

.peek {
  cursor: pointer;
}
</style>
