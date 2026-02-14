<template>
  <VButton :class="['bigger-video-preview-button', btnClass]" style="padding: 0" @click="onClick">
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
  transition: opacity 0.3s ease;
  position: absolute;
  top: 6px;
  left: 6px;
  background-color: aqua;
  height: 28px;
  width: 28px;
  z-index: 9;
}

.bili-video-card__image--wrap:hover .bigger-video-preview-button-index {
  opacity: 1;
}

// 首页视频卡片预览放大按钮
.bigger-video-preview-button-index {
  @extend .bigger-video-preview-button;
}

.pic-box:hover .bigger-video-preview-button-video {
  opacity: 1;
}

// 视频页视频卡片预览放大按钮
.bigger-video-preview-button-video {
  @extend .bigger-video-preview-button;
}
</style>
