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
    <span class="tip">{{ tip }}</span>
  </div>
</template>

<script lang="ts">
import { showCanvas, VIcon } from '@/ui'
import { createSnapshotGrid } from './handler'
import { logError } from '@/core/utils/log'

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
      tip: '查看预览图',
    }
  },
  methods: {
    async onClick(event: MouseEvent) {
      event.preventDefault()
      if (this.disabled) {
        return
      }
      try {
        this.disabled = true
        this.tip = '预览图加载中…'
        if (!this.canvas) {
          this.canvas = await createSnapshotGrid(this.vid, this.cid)
        }
        await showCanvas(this.canvas, `${this.title}_snapshot.jpg`)
      } catch (error) {
        logError(error)
      } finally {
        this.tip = '查看预览图'
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
  z-index: 21;
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

.video-page-card-small .pic-box:hover .view-snapshot-button {
  transition-delay: 0.3s;
  opacity: 1;
}
</style>
