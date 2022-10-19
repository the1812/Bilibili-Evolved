<template>
  <div class="minimal-home-operations">
    <VButton
      round
      icon
      class="minimal-home-operations-refresh"
      title="刷新"
      @click="
        backToTop()
        $emit('refresh')
      "
    >
      <VIcon icon="mdi-refresh" :size="size" />
    </VButton>
    <VButton round icon class="minimal-home-operations-top" title="返回顶部" @click="backToTop">
      <VIcon icon="mdi-arrow-up" :size="size" />
    </VButton>
  </div>
</template>
<script lang="ts">
import { VButton, VIcon } from '@/ui'

export default Vue.extend({
  components: { VButton, VIcon },
  data() {
    return {
      size: 28,
    }
  },
  methods: {
    backToTop() {
      window.scrollTo(0, 0)
    },
  },
})
</script>
<style lang="scss">
@import 'common';
@import 'effects';

.minimal-home-operations {
  @include v-center(12px);
  position: fixed;
  bottom: 48px;
  right: 48px;
  .be-button {
    padding: 8px !important;
    opacity: 0.5;
    &:hover {
      opacity: 1;
    }
  }
  &-refresh {
    .mdi {
      @include rotate();
    }
  }
  &-top {
    .mdi:hover {
      @include bounce-y(-2);
    }
  }
}
</style>
