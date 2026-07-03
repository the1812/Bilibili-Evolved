<template>
  <div class="canvas-viewer-container" :class="{ open }" @click="detectOutside">
    <div ref="viewer" class="viewer">
      <div ref="canvasContainer" class="canvas-container"></div>
      <div class="close icon" title="关闭" @click="open = false">
        <VIcon :size="48" icon="mdi-close"></VIcon>
      </div>
      <a
        v-if="filename"
        class="download icon"
        :class="status"
        :title="statusMessage"
        :href="blobUrl || 'javascript:void(0)'"
        :download="filename"
      >
        <VIcon :size="48" icon="mdi-download"></VIcon>
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import VIcon from './icon/VIcon.vue'

export default Vue.extend({
  components: {
    VIcon,
  },
  data() {
    return {
      open: false,
      keyHandler: null,
      canvas: <HTMLCanvasElement>null,
      filename: '',
      blobUrl: '',
      status: '',
      statusMessage: '',
    }
  },
  mounted() {
    this.keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.open = false
      }
    }
    document.addEventListener('keydown', this.keyHandler)
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.keyHandler)
  },
  methods: {
    detectOutside(e: MouseEvent) {
      const container = this.$el
      const { viewer } = this.$refs
      if (e.target === container || e.target === viewer) {
        this.open = false
      }
    },
    setCanvas(canvas: HTMLCanvasElement, filename?: string, forceUpdate = false) {
      if (!forceUpdate && canvas === this.canvas) {
        return
      }
      if (this.blobUrl) {
        URL.revokeObjectURL(this.blobUrl)
      }
      this.canvas = canvas
      this.blobUrl = ''
      const container: HTMLElement = this.$refs.canvasContainer
      container.innerHTML = ''
      container.appendChild(canvas)
      this.filename = filename
      if (filename) {
        this.status = 'wait'
        this.statusMessage = '正在创建图片……'
        canvas.toBlob(blob => {
          if (!blob) {
            this.status = 'error'
            this.statusMessage = `无法下载图片：为Canvas创建图片失败`
            throw new Error('[CanvasViewer] 为 Canvas 创建图片失败')
          }
          this.status = 'ready'
          this.statusMessage = `下载 ${filename}`
          this.blobUrl = URL.createObjectURL(blob)
        }, 'image/jpeg')
      }
    },
  },
})
</script>

<style lang="scss" scoped>
.canvas-viewer-container {
  background: rgba(0, 0, 0, 0.85);
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100002;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  pointer-events: none;
  color: #eee;

  &,
  & * {
    transition: 0.2s ease-out;
  }
  &.open {
    opacity: 1;
    pointer-events: initial;
  }
  .viewer {
    width: 90%;
    height: 90%;
    display: grid;
    grid-template:
      'image close' 48px
      'image .' auto
      'image download' 48px / auto 48px;
    column-gap: 12px;
    justify-items: center;
    justify-content: stretch;
    align-items: center;
    align-content: stretch;
    transform: scale(0.95);
    .canvas-container {
      grid-area: image;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      &:deep(canvas) {
        flex: 1 0 0;
        height: 0;
        object-fit: contain;
      }
    }
    .close {
      grid-area: close;
    }
    .download {
      grid-area: download;
    }
    .icon {
      cursor: pointer;
      width: 100%;
      height: 100%;
      transition: 0.2s ease-out;
      color: #eee;
      &.ready:hover .be-icon {
        color: var(--theme-color);
      }
      &.wait {
        cursor: wait;
        opacity: 0.8;
      }
      &.error {
        cursor: not-allowed;
        color: #f44336;
      }
    }
  }
  &.open .viewer {
    transform: scale(1);
  }
}
</style>
