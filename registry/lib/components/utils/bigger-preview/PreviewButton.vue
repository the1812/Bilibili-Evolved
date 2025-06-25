<template>
  <VButton :class="['bigger-preview-button', btnClass]" style="padding: 0" @click="onClick">
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
.bili-video-card__image:hover .bigger-preview-button-index {
  opacity: 1;
}

// 通用放大按钮样式
.bigger-preview-button {
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

// 首页视频卡片预览放大按钮
.bigger-preview-button-index {
  @extend .bigger-preview-button;
}

.pic-box:hover .bigger-preview-button-video {
  opacity: 1;
}

// 视频页视频卡片预览放大按钮
.bigger-preview-button-video {
  @extend .bigger-preview-button;
}
</style>
