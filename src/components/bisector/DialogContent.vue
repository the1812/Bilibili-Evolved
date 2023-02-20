<template>
  <div class="bisector-dialog-content-container">
    <div class="bisector-dialog-content-text">
      组件二等分进行中，预计剩余
      <b style="color: var(--theme-color)">{{ rouge }} </b>轮次，请确认当前情况：
    </div>
    <div class="bisector-dialog-button-group">
      <VButton @click="onGood">正常</VButton>
      <VButton @click="onBad">不正常</VButton>
      <VButton type="primary" @click="onAbort">终止</VButton>
    </div>
    <div class="bisector-dialog-content-text weak">
      *可以点击×号关闭对话框，刷新页面后，会再次询问
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { VButton } from '@/ui'

export default Vue.extend({
  components: { VButton },
  props: {
    rouge: {
      type: Number,
      required: true,
    },
    onAbort: {
      type: Function,
      default: none,
    },
    onGood: {
      type: Function,
      default: none,
    },
    onBad: {
      type: Function,
      default: none,
    },
  },
})
</script>

<style lang="scss" scoped>
.bisector-dialog-content-container {
  padding: 0 16px;

  .bisector-dialog-content-text {
    &.weak {
      opacity: 0.6;
    }
  }

  .bisector-dialog-content-text,
  .bisector-dialog-button-group {
    margin-bottom: 8px;
  }

  .bisector-dialog-button-group {
    display: grid;
    gap: 8px;
    grid-template-columns: 1fr 1fr;
    .be-button:last-child {
      grid-column: span 2;
    }
  }
}
</style>
