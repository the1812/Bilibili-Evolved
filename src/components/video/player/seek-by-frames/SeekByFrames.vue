<template>
  <div class="seek-by-frames">
    <div class="prev-frame" title="上一帧" @click="setFrame(-1)">
      <span>
        <VIcon class="seek-by-frames-icon" icon="left-arrow"></VIcon>
      </span>
    </div>
    <div class="next-frame" title="下一帧" @click="setFrame(1)">
      <span>
        <VIcon class="seek-by-frames-icon" icon="right-arrow"></VIcon>
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { attributesSubtree } from '@/core/observer'
import { dq } from '@/core/utils'
import { SeekByFramesDisabledClass } from '.'

export default Vue.extend({
  components: {
    VIcon: () => import('@/ui/icon/VIcon.vue').then(m => m.default),
  },
  data() {
    return {
      frameTime: 0,
    }
  },
  mounted() {
    attributesSubtree(
      '.bilibili-player-video-quality-menu ul.bui-select-list',
      () => {
        const selectedQuality = dq(
          '.bilibili-player-video-quality-menu .bui-select-item-active',
        )
        const quality = selectedQuality
          ? parseInt(selectedQuality.getAttribute('data-value'))
          : 0
        const fps = (() => {
          switch (quality) {
            // 60fps
            case 116:
            case 74:
              return 60000 / 1001
            // 30fps
            default:
              return 30000 / 1001
          }
        })()
        this.frameTime = 1 / fps
      },
    )
    document.addEventListener('keydown', e => {
      const isTyping = ['input', 'textarea'].includes(
        document.activeElement.nodeName.toLowerCase(),
      )
      if (isTyping) {
        return
      }
      if (document.body.classList.contains(SeekByFramesDisabledClass)) {
        return
      }
      if (e.shiftKey) {
        if (e.key === 'ArrowLeft') {
          e.stopPropagation()
          e.preventDefault()
          this.setFrame(-1)
        } else if (e.key === 'ArrowRight') {
          e.stopPropagation()
          e.preventDefault()
          this.setFrame(1)
        }
      }
    })
  },
  methods: {
    setFrame(num: number) {
      const video = dq('video') as HTMLVideoElement
      video.currentTime += this.frameTime * num
    },
  },
})
</script>

<style lang="scss">
.seek-by-frames {
  display: flex;
  align-items: center;
  height: 22px;
  padding-left: 4px;
  color: #f2f2f2;
  cursor: pointer;
  body.touch-player-control & {
    height: calc(100% + 1px);
    align-items: flex-start;
    margin-top: -1px;
    > * {
      padding: 0 2px;
      height: 100%;
    }
  }
  body.touch-player-control.player-mode-fullscreen &,
  body.touch-player-control.player-mode-webfullscreen & {
    > * {
      padding-top: 4px;
    }
  }
  .seek-by-frame-disable & {
    display: none;
  }
  .player-mode-fullscreen &,
  .player-mode-webfullscreen & {
    height: 32px;
    padding-left: 12px;
    .seek-by-frames-icon {
      $size: 28px;
      font-size: $size;
      width: $size;
      height: $size;
    }
    > *:not(:last-child) {
      margin-right: 8px;
    }
  }
}
.bilibili-player-video-control-bottom-center {
  padding-left: 14px !important;
}
</style>
