<template>
  <div
    class="dm-quick-merge-btn"
    :class="{ active: merged }"
    :style="busyStyle"
    @click.stop.prevent="onClick"
  >
    <svg v-if="merged" viewBox="0 0 24 24" width="20" height="20" fill="white">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
    </svg>
    <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
    <span class="dm-quick-tip">{{ tipText }}</span>
  </div>
</template>

<script lang="ts">
import { QUICK_MERGE_BUTTON_EVENTS } from './contracts'

export default Vue.extend({
  name: 'QuickMergeButton',
  props: {
    /** 卡片对应 BV 号；无有效 BV 时不响应点击 */
    bvid: {
      type: String,
      default: '',
    },
    /** 是否已并入当前播放页弹幕 */
    merged: {
      type: Boolean,
      default: false,
    },
    /** 异步合并/移除进行中，禁止重复点击 */
    busy: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    tipText(): string {
      return this.merged ? '已并入弹幕 (点击移除)' : '一键并入弹幕'
    },
    busyStyle(): Record<string, string> | undefined {
      return this.busy ? { pointerEvents: 'none' } : undefined
    },
  },
  methods: {
    onClick() {
      if (!this.bvid || this.busy) {
        return
      }
      this.$emit(QUICK_MERGE_BUTTON_EVENTS.TOGGLE_MERGE, { bvid: this.bvid })
    },
  },
})
</script>

<style lang="scss">
@import './quick-merge.scss';
</style>
