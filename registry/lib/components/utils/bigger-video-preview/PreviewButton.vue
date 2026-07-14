<template>
  <VButton
    :class="[
      'bigger-video-preview-button',
      btnClass,
      { 'bigger-video-preview-button-show': enlarged },
    ]"
    style="padding: 0"
    @click="onClick"
  >
    <VIcon :icon="enlarged ? 'mdi-magnify-minus' : 'mdi-magnify-plus'" :size="16"></VIcon>
  </VButton>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { VIcon, VButton } from '@/ui'

export default defineComponent({
  name: 'PreviewButton',
  components: {
    VIcon,
    VButton,
  },
  props: {
    btnClass: {
      type: String,
      required: true,
    },
    btnOnClickCallback: {
      type: Function,
      required: true,
    },
    enlarged: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    onClick(event: MouseEvent) {
      this.btnOnClickCallback(event)
    },
  },
})
</script>

<style lang="scss">
// 通用放大按钮样式
.bigger-video-preview-button {
  opacity: 0;
  position: absolute;
  border-radius: 6px !important;
  background-color: rgba(33, 33, 33, 0.8) !important;
  height: 28px;
  width: 28px;
  z-index: 9;
}

// 首页视频卡片预览放大按钮
.bili-video-card__image--wrap:hover .bigger-video-preview-button-index,
.bigger-video-preview-button-index.bigger-video-preview-button-show {
  opacity: 1;
  transition: opacity 0.2s linear 0.2s;
  top: 8px;
  left: 8px;
}
.bigger-video-preview-button-index {
  @extend .bigger-video-preview-button;
}

// 视频页视频卡片预览放大按钮
.pic-box:hover .bigger-video-preview-button-video,
.bigger-video-preview-button-video.bigger-video-preview-button-show {
  opacity: 1;
  transition: opacity 0.3s linear 0.3s;
  top: 6px;
  left: 6px;
}
.bigger-video-preview-button-video {
  @extend .bigger-video-preview-button;
}

// 合集页视频卡片预览放大按钮
.pic-box:hover .bigger-video-preview-button-list,
.bigger-video-preview-button-list.bigger-video-preview-button-show {
  opacity: 1;
  transition: opacity 0.3s linear 0.3s;
  top: 6px;
  left: 6px;
}
.bigger-video-preview-button-list {
  @extend .bigger-video-preview-button;
}
</style>
