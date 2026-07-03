<template>
  <span
    class="be-danmaku-merger video-toolbar-left-item"
    title="点击合并其他视频的弹幕"
    @click="onClick"
  >
    <svg
      class="be-danmaku-merger-icon"
      viewBox="0 0 24 24"
      width="28"
      height="28"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="6" cy="6" r="3" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="12" cy="18" r="3" />
      <path d="M6 9 C 6 13.5, 12 11, 12 15" />
      <path d="M18 9 C 18 13.5, 12 11, 12 15" />
    </svg>
    <span class="be-danmaku-merger-text">合并弹幕</span>
  </span>
</template>

<script lang="ts">
import { MERGER_BUTTON_EVENTS } from './contracts'

export default Vue.extend({
  name: 'MergerButton',
  methods: {
    onClick() {
      this.$emit(MERGER_BUTTON_EVENTS.OPEN)
    },
  },
})
</script>

<style lang="scss">
.video-toolbar-left,
.video-toolbar .ops,
.video-toolbar-v1 .toolbar-left {
  .be-danmaku-merger {
    cursor: pointer;
    color: var(--text2, #61666d);
    font-size: 13px;
    margin-left: -20px;
    margin-right: 28px !important;
    display: inline-flex;
    align-items: center;
    position: relative;
    width: auto !important;
    transition: color 0.3s;

    &:hover {
      color: #00aeec;
    }

    &-icon {
      margin-right: 6px;
      flex-shrink: 0;

      @media (min-width: 1681px) {
        width: 36px;
        height: 36px;
      }
    }

    &-text {
      font-weight: 400;
      font-size: 14px;
    }
  }
}

.video-toolbar-left .be-danmaku-merger-icon {
  transform: translateY(1px);
}
</style>
