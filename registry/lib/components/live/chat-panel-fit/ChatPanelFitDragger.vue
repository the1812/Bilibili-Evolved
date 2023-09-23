<template>
  <div
    ref="draggerElement"
    class="chat-panel-fit-dragger"
    :class="{ dragging: isDragging }"
    :style="{ transform: `translateX(${-movement}px)` }"
    @pointerdown="startDragging"
    @pointermove="handlePointerMove"
    @dblclick="resetCustomWidth"
  >
    <div class="chat-panel-fit-dragger-bar"></div>
    <div class="chat-panel-fit-dragger-preview-area" :style="{ width: `${previewWidth}px` }">
      <div class="chat-panel-fit-dragger-preview-area-background">
        {{ previewWidth.toFixed(1) }}px
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, reactive, ref, onBeforeMount } from 'vue'
import { getComponentSettings } from '@/core/settings'
import { ChatPanelFitOptions, ChatPanelFitOptionsMinWidth } from './options'

const options = reactive(getComponentSettings<ChatPanelFitOptions>('liveChatPanelFit').options)
onBeforeMount(() => {
  if (options.customWidth !== 0) {
    document.documentElement.style.setProperty(
      '--live-chat-panel-width',
      `${options.customWidth}px`,
    )
  }
})
const getAutoWidth = () =>
  parseFloat(document.documentElement.style.getPropertyValue('--live-chat-panel-width'))
const draggerElement = ref<HTMLElement>()
const startPoint = ref(0)
const movement = ref(0)
const previewWidth = computed(() => {
  if (options.customWidth) {
    return options.customWidth + movement.value
  }
  return getAutoWidth()
})
const isDragging = ref(false)

const resetCustomWidth = () => {
  options.customWidth = 0
  window.dispatchEvent(new CustomEvent('customWidthReset'))
}
const handlePointerMove = (e: PointerEvent) => {
  if (!isDragging.value) {
    return
  }
  const currentMovement = startPoint.value - e.screenX
  movement.value =
    lodash.clamp(
      options.customWidth + currentMovement,
      ChatPanelFitOptionsMinWidth,
      options.maxWidth,
    ) - options.customWidth
}
const startDragging = (e: PointerEvent) => {
  isDragging.value = true
  startPoint.value = e.screenX
  if (options.customWidth === 0) {
    options.customWidth = getAutoWidth()
  }
  draggerElement.value.setPointerCapture(e.pointerId)
  document.documentElement.style.cursor = 'ew-resize'
  document.documentElement.classList.add('custom-width-dragging')
  document.documentElement.addEventListener(
    'pointerup',
    () => {
      document.documentElement.style.cursor = ''
      document.documentElement.classList.remove('custom-width-dragging')
      isDragging.value = false
      startPoint.value = 0
      if (!movement.value) {
        return
      }
      const newWidth = previewWidth.value
      options.customWidth = newWidth
      movement.value = 0
      document.documentElement.style.setProperty('--live-chat-panel-width', `${newWidth}px`)
    },
    { once: true },
  )
}
</script>
<style lang="scss">
@import 'common';

// 拖动时暂时提高 z-index, 否则预览区域会被挡住
html.custom-width-dragging .player-full-win:not(.hide-aside-area) .player-ctnr {
  z-index: 1001 !important;
  .head-info-section {
    display: none !important;
  }
}
.aside-area-toggle-btn {
  height: 90px;
  @include absolute-v-center();
}
.chat-panel-fit-dragger {
  $dragger-width: 8px;
  pointer-events: none;
  touch-action: none;
  height: 100%;
  width: 0;
  position: absolute;
  right: 0;
  top: 0;
  @include v-stretch();
  .player-full-win:not(.hide-aside-area) & {
    pointer-events: initial;
  }
  &-bar {
    opacity: 0;
    cursor: ew-resize;
    transition: opacity 0.2s ease-out;
    flex-grow: 1;
    width: $dragger-width;
    height: 100%;
    background-color: var(--theme-color);
    transform: translateX(#{-$dragger-width});
    @include v-center();
    html.custom-width-dragging &,
    &:hover {
      opacity: 1;
    }
  }
  &-preview-area {
    opacity: 0;
    @include v-stretch();
    pointer-events: none;
    position: absolute;
    top: 0;
    height: 100%;
    font-size: 16px;
    background-color: #fff;
    color: #000;
    body.dark & {
      background-color: #222;
      color: #eee;
    }
    &-background {
      flex-grow: 1;
      background-color: var(--theme-color-10);
      @include h-center();
      justify-content: center;
    }
  }
  &.dragging &-preview-area {
    opacity: 1;
  }
}
</style>
