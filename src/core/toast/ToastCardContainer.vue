<template>
  <transition-group class="toast-card-container" name="toast-card-container" tag="div">
    <ToastCard
      v-for="card of cards"
      :key="card.key"
      :data-key="card.key"
      :card="card as Toast"
    ></ToastCard>
  </transition-group>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from 'vue'
import type { Toast } from '@/core/toast/index'

export default defineComponent({
  components: {
    ToastCard: defineAsyncComponent(() => import('./ToastCard.vue')),
  },
  data() {
    return {
      cards: [] as Toast[],
    }
  },
})
</script>

<style lang="scss">
.toast-card-container {
  --card-min-width: 240px;
  --card-min-width-negative: -240px;
  position: fixed;
  left: 0;
  bottom: 0;
  display: flex;
  flex-direction: column-reverse;
  align-items: flex-start;
  padding-left: 16px;
  z-index: 100001;
  pointer-events: none;
  overflow: hidden;
  width: 100%;
  height: 100%;
  transition: 0.2s ease-out;
  * {
    pointer-events: initial;
    transition: 0.2s ease-out;
  }
}
</style>
