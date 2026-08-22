<template>
  <div class="canvas-viewer-container" :class="{ open }" @click="detectOutside">
    <div ref="viewer" class="viewer">
      <div v-show="!canvas" class="loading-container" :class="{ error: loadingError }">
        <VLoading ref="vLoading" />
      </div>
      <div v-show="canvas" ref="canvasContainer" class="canvas-container"></div>
      <div class="close icon" title="关闭" @click="open = false">
        <VIcon :size="48" icon="mdi-close"></VIcon>
      </div>
      <a
        v-if="canvas && filename"
        class="download icon"
        :class="blobStatus"
        :title="downloadMessage"
        :href="blobUrl || 'javascript:void(0)'"
        :download="filename"
      >
        <VIcon :size="48" icon="mdi-download"></VIcon>
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import { nextTick } from 'vue'
import VIcon from './icon/VIcon.vue'
import VLoading from './VLoading.vue'

export default Vue.extend({
  name: 'CanvasViewer',
  components: {
    VIcon,
    VLoading,
  },
  data() {
    return {
      open: false,
      keyHandler: null,
      canvas: <HTMLCanvasElement>null,
      filename: '',
      blobUrl: '',
      blobStatus: '',
      downloadMessage: '',
      loadingError: false,
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
      if (e.target === this.$el || e.target === this.$refs.viewer) {
        this.open = false
      }
    },
    async setCanvas(canvas: HTMLCanvasElement, update = false) {
      if (!update && canvas === this.canvas) {
        return false
      }
      if (this.blobUrl) {
        URL.revokeObjectURL(this.blobUrl)
      }
      this.canvas = canvas
      this.blobUrl = null
      this.filename = null
      const container: HTMLElement = this.$refs.canvasContainer
      container.innerHTML = ''
      container.appendChild(canvas)
      await nextTick()
      return new Promise<boolean>(resolve => {
        requestAnimationFrame(() => {
          resolve(true)
        })
      })
    },
    async setDownloadable(filename: string) {
      if (!this.canvas) {
        throw new Error('[CanvasViewer] Canvas not ready')
      }
      if (!filename) {
        return Promise.resolve()
      }
      this.filename = filename
      this.blobStatus = 'wait'
      this.downloadMessage = '正在创建图片……'
      await nextTick()
      return new Promise<void>((resolve, reject) => {
        requestAnimationFrame(() => {
          this.canvas.toBlob(blob => {
            if (!blob) {
              this.blobStatus = 'error'
              this.downloadMessage = `无法下载图片：为Canvas创建图片失败`
              reject(new Error('[CanvasViewer] Failed to create image from canvas'))
            } else {
              this.blobStatus = 'ready'
              this.downloadMessage = `下载 ${filename}`
              this.blobUrl = URL.createObjectURL(blob)
              resolve()
            }
          }, 'image/jpeg')
        })
      })
    },
    setLoadingMessage(msg: string | Error) {
      if (msg instanceof Error) {
        msg = msg.message
        this.loadingError = true
      } else {
        this.loadingError = false
      }
      this.$refs.vLoading.config.content = msg
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
  z-index: 100000;
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
    .loading-container {
      grid-area: image;
      &.error {
        color: #f44336;
      }
    }
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
      &:hover .be-icon {
        color: var(--theme-color);
      }
      &.wait {
        cursor: wait;
        opacity: 0.8;
        .be-icon {
          color: #eee;
        }
      }
      &.error {
        cursor: not-allowed;
        .be-icon {
          color: #f44336;
        }
      }
    }
  }
  &.open .viewer {
    transform: scale(1);
  }
}
</style>
