<template>
  <div
    role="button"
    class="view-snapshot-button"
    :class="position"
    tabindex="-1"
    :aria-disabled="disabled"
    @click="onClick"
  >
    <VIcon icon="mdi-image-multiple" size="20"></VIcon>
    <span class="tip">查看预览图</span>
  </div>
</template>

<script lang="ts">
import { VIcon } from '@/ui'
import { createSnapshotGrid, getOptions, openViewer, getConsole } from './handler'

export default Vue.extend({
  components: {
    VIcon,
  },
  props: {
    position: {
      type: String,
      default: 'top left',
    },
    title: {
      type: String,
      required: true,
    },
    vid: {
      type: [Number, String],
      required: true,
    },
    cid: {
      type: Number,
      default: -1,
    },
  },
  data() {
    return {
      disabled: false,
      canvas: <HTMLCanvasElement>null,
    }
  },
  methods: {
    async onClick(event: MouseEvent) {
      event.preventDefault()
      event.stopPropagation()
      if (this.disabled) {
        return
      }
      const viewer = await openViewer()
      this.disabled = true
      try {
        if (!this.canvas) {
          this.canvas = await createSnapshotGrid(this.vid, this.cid)
        }
        if ((await viewer.setCanvas(this.canvas)) && getOptions().enablePreviewDownload) {
          await viewer.setDownloadable(`${this.title}_snapshot.jpg`)
        }
      } catch (error) {
        viewer.setLoadingMessage(error)
        getConsole().error(error)
      } finally {
        this.disabled = false
      }
    },
  },
})
</script>

<style lang="scss">
.view-snapshot-button {
  opacity: 0;
  transition: opacity 0.3s;
  position: absolute;
  color: rgba(255, 255, 255, 0.9);
  background-color: rgba(0, 0, 0, 0.6);
  height: 28px;
  width: 28px;
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #0000;
  border-radius: 6px;
  cursor: pointer;

  &.top {
    top: 6px;
  }
  &.bottom {
    bottom: 6px;
  }
  &.left {
    left: 6px;
  }
  &.right {
    right: 6px;
  }

  .tip {
    opacity: 0;
    transition: opacity 0.4s;
    position: absolute;
    top: 32px;
    font-size: 12px;
    color: #fff;
    border-radius: 4px;
    line-height: 18px;
    padding: 4px 8px;
    background: rgba(0, 0, 0, 0.8);
    white-space: nowrap;
  }

  &:hover .tip {
    transition-delay: 0.4s;
    opacity: 1;
  }
}

.video-page-card-small .pic-box .view-snapshot-button {
  &.top.right {
    right: 36px;
  }
}

.video-page-card-small .pic-box:hover .view-snapshot-button {
  transition-delay: 0.3s;
  opacity: 1;
}

.space-main .bili-video-card .bili-video-card__cover .view-snapshot-button {
  transition: opacity 0.2s linear;
  &.top {
    top: 8px;
  }
  &.top.right {
    right: 38px;
  }

  &.left .tip {
    top: 0;
    left: 28px;
  }
  &.right.bottom .tip {
    top: 0;
    right: 28px;
  }
}
.space-main .bili-video-card .bili-video-card__cover:hover .view-snapshot-button {
  opacity: 1;
}

.bili-dyn-card-video__cover .view-snapshot-button {
  transition: opacity 0.2s cubic-bezier(0.22, 0.58, 0.12, 0.98);
  &.top.right {
    right: 36px;
  }
  &.left .tip {
    top: 0;
    left: 28px;
  }
  &.right.bottom .tip {
    top: 0;
    right: 28px;
  }
}
.bili-dyn-card-video__cover:hover .view-snapshot-button {
  opacity: 1;
}
</style>
