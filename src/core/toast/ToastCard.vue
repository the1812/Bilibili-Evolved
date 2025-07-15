<template>
  <div
    class="toast-card visible"
    :class="'toast-' + card.type"
    @mouseover="stopTimer"
    @mouseout="startTimer"
  >
    <div class="toast-card-border"></div>
    <div class="toast-card-header">
      <h1 class="toast-card-title">
        {{ card.title }}
      </h1>
      <div
        class="toast-card-close"
        :class="{ 'show-progress': Boolean(remainingTime) }"
        title="关闭"
        @click="card.close()"
      >
        <ProgressRing
          :size="28"
          :stroke="2"
          :progress="progressMax - remainingTime"
          :max="progressMax"
        />
        <VIcon icon="close" :size="14" />
      </div>
    </div>
    <div class="toast-card-message" v-html="card.message"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { VIcon, ProgressRing } from '@/ui'
import type { Toast } from '.'

interface Props {
  card: Toast
}

const props = defineProps<Props>()

const progressMax = ref(0)
const remainingTime = ref(0)

const durationTick = () => {
  const { closeTime } = props.card
  if (!closeTime) {
    return
  }
  remainingTime.value = closeTime - Number(new Date())
  if (remainingTime.value > 0) {
    requestAnimationFrame(() => durationTick())
  }
}

const readDuration = () => {
  const { duration, closeTime } = props.card
  if (duration) {
    progressMax.value = closeTime - Number(new Date())
    remainingTime.value = progressMax.value
    requestAnimationFrame(() => durationTick())
  }
}

const stopTimer = () => {
  props.card.clearDuration()
  progressMax.value = 0
  remainingTime.value = 0
}

const startTimer = () => {
  props.card.setDuration()
  readDuration()
}

onMounted(() => {
  readDuration()
})
</script>

<style lang="scss">
@import 'common';
.toast-card {
  background: var(--be-card-background-color, #fff);
  min-width: var(--card-min-width);
  max-width: 60vw;
  min-height: 87px;
  margin: 8px 0;
  @include shadow();
  box-sizing: border-box;
  border: 1px solid #8884;
  transform-origin: left;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
  position: relative;
  padding-left: 8px;
  border-radius: 8px;

  &.toast-card-container-enter,
  &.toast-card-container-leave-to {
    opacity: 0;
    transform: translateX(var(--card-min-width-negative));
  }
  &.toast-card-container-leave-active {
    position: absolute;
    transition: 0.3s cubic-bezier(0.6, -0.28, 0.74, 0.05);
  }
  &-header {
    @include h-center();
  }
  &-title {
    font-size: 18px;
    color: var(--be-text-title-color, #444);
    opacity: 0.5;
    margin: 12px;
    @include semi-bold();
    flex: 1 1 auto;
  }
  &-close {
    height: 24px;
    width: 24px;
    @include h-center();
    position: relative;
    justify-content: center;
    flex: 0 0 auto;
    padding: 14px;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    box-sizing: content-box;
    opacity: 0.75;
    &:hover {
      opacity: 0.85;
      .be-icon {
        transform: scale(1.2);
      }
    }
    &:active {
      opacity: 0.9;
      .be-icon {
        transform: scale(1.3);
      }
    }

    .be-icon {
      transition: 0.2s ease-out;
    }
    .be-progress-ring {
      @include absolute-center();
      --ring-color: currentColor;
      opacity: 0;
    }
    &.show-progress .be-progress-ring {
      opacity: 1;
    }
  }
  &-message {
    color: var(--be-text-content-color, #000);
    font-size: 14px;
    margin: 0 16px 12px 12px;
    white-space: pre-wrap;
    display: flex;
    align-items: center;
    line-height: 1.5;
    flex-wrap: wrap;
    word-break: break-all;
    max-height: 200px;
    overflow: auto;
  }
  &-border {
    position: absolute;
    border-radius: 2px;
    height: calc(100% - 10px);
    width: 4px;
    top: 5px;
    left: 0;
  }
  @each $name, $color in (default: #444, error: #f44336, info: #2196f3, success: #8bc34a) {
    &.toast-#{$name} .toast-card-border {
      background-color: $color;
    }
  }
  span,
  .link {
    display: inline-block;
    padding: 2px 4px;
    margin: 2px;
    background-color: var(--be-tag-background-color, #8882);
    color: var(--be-text-content-color, #000);
    text-decoration: none;
    transition: all 0.2s ease-out;
    border-radius: 6px;
  }
  .link {
    cursor: pointer;
    &:hover {
      background-color: var(--be-tag-hover-background-color, #8883);
    }
    &:active {
      background-color: var(--be-tag-active-background-color, #8884);
    }
  }
  .download-link,
  .download-link:hover {
    color: inherit !important;
    text-decoration: underline;
    word-break: break-all;
  }
}
</style>
