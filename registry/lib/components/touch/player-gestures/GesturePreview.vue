<template>
  <div class="gesture-preview" :class="{ opened }">
    <div class="gesture-preview-content">
      <div class="brightness">
        <ProgressRing :size="100" :progress="preview.brightness * 100"></ProgressRing>
        <div class="label">
          <div class="name">亮度</div>
          <div class="value">
            {{ preview.brightness | percent }}
          </div>
        </div>
      </div>
      <div class="progress">
        <div class="videoshot" :style="videoshotStyle"></div>
        <div v-show="preview.progress !== null" class="preview">
          <div v-if="!progressNaN" class="diff">
            {{ (preview.progress - store.progress) | progressDiff }}
          </div>
          <div class="seek-mode">
            {{ !progressNaN ? preview.seekMode : '取消调整' }}
          </div>
        </div>
        <div v-show="preview.progress === null" class="name">进度</div>
        <div class="progress-label">
          {{ (progressValid ? preview.progress : store.progress) | progress }}
        </div>
      </div>
      <div class="volume">
        <ProgressRing :size="100" :progress="preview.volume * 100"></ProgressRing>
        <div class="label">
          <div class="name">音量</div>
          <div class="value">
            {{ preview.volume | percent }}
          </div>
        </div>
      </div>
    </div>
    <div class="progress-bar">
      <ProgressBar
        :progress="progressValid ? preview.progress : store.progress"
        :max="video.duration"
      ></ProgressBar>
    </div>
  </div>
</template>
<script lang="ts">
import { ProgressBar, ProgressRing } from '@/ui'
import { fixed } from '@/core/utils'
import { formatPercent, formatDuration } from '@/core/utils/formatters'
import { GesturePreviewParams, ProgressSeekMode } from './gesture-preview'
import { Videoshot } from './videoshot'
import { syncVolumeUI } from './volume'

/**
 * 将秒数转为中文时间的小函数
 * @param sec 秒数
 */
const secondsToTime = (sec: number) => {
  sec = Math.abs(sec)
  const hours = Math.floor(sec / 3600)
  const minutes = Math.floor((sec - hours * 3600) / 60)
  const seconds = sec - hours * 3600 - minutes * 60

  let result = `${fixed(seconds)}秒`
  if (minutes > 0) {
    result = `${minutes}分${result}`
  }
  if (hours > 0) {
    result = `${hours}时${result}`
  }

  return result
}
const normalize = (current: number, add: number, max = 1, min = 0) => {
  const finalValue = current + add
  if (finalValue > max) {
    return max
  }
  if (finalValue < min) {
    return min
  }
  return finalValue
}
export default Vue.extend({
  components: {
    ProgressRing,
    ProgressBar,
  },
  filters: {
    percent: formatPercent,
    progress: (p: number) => formatDuration(p, 1),
    progressDiff(diff: number) {
      const symbol = diff > 0 ? '+' : '-'
      return `${symbol}${secondsToTime(diff)}`
    },
  },
  data() {
    const defaultStore = {
      progress: 0,
      brightness: 1,
      volume: 0.66,
    }
    return {
      opened: false,
      video: dq('video'),
      videoshot: new Videoshot(),
      videoshotStyle: {},
      store: defaultStore,
      preview: {
        ...defaultStore,
        /**
         * - `null`: 未在调整时间
         * - `number`: 预览即将跳跃到的时间
         * - `NaN`: 取消时间调整
         */
        progress: null,
        seekMode: ProgressSeekMode.Fast,
      },
    }
  },
  computed: {
    progressNaN() {
      return Number.isNaN(this.preview.progress)
    },
    progressNull() {
      return this.preview.progress === null
    },
    progressValid() {
      return !this.progressNaN && !this.progressNull
    },
  },
  methods: {
    sync() {
      const video = dq('video') as HTMLVideoElement
      this.video = video
      this.store.volume = video.volume
      this.store.progress = video.currentTime
      this.store.brightness = (() => {
        if (video.style.filter) {
          const match = video.style.filter.match(/brightness\((.+)\)/)
          if (match) {
            return parseFloat(match[1])
          }
          return 1
        }
        return 1
      })()
      this.preview = { ...this.preview, ...this.store, progress: null }
    },
    startPreview({ brightness, volume, progress }: GesturePreviewParams) {
      this.opened = true
      if (progress !== undefined) {
        this.preview.progress = normalize(this.store.progress, progress, this.video.duration)
        const videoshot = this.videoshot as Videoshot
        videoshot.getVideoshot(this.preview.progress).then(style => {
          this.videoshotStyle = style
        })
      } else {
        if (brightness !== undefined) {
          this.preview.brightness = normalize(this.store.brightness, brightness, Infinity)
        } else if (volume !== undefined) {
          this.preview.volume = normalize(this.store.volume, volume)
        }
        this.apply({ brightness, volume })
      }
    },
    cancelPreview() {
      this.preview.progress = NaN
    },
    endPreview() {
      if (!unsafeWindow.touchGestureDebug) {
        this.opened = false
      }
      if (this.store.volume !== this.preview.volume) {
        syncVolumeUI(this.preview.volume)
      }
      if (Number.isNaN(this.preview.progress)) {
        this.preview.progress = null
        return
      }
      if (this.store.progress !== this.preview.progress && this.preview.progress !== null) {
        this.apply({ progress: this.preview.progress })
      }
    },
    async apply({ brightness, volume, progress }: GesturePreviewParams) {
      const video = this.video as HTMLVideoElement
      if (!video) {
        return
      }
      if (brightness !== undefined) {
        const { setBrightness } = await import('./brightness')
        setBrightness(video, this.preview.brightness)
      } else if (volume !== undefined) {
        const { setVolume } = await import('./volume')
        setVolume(video, this.preview.volume)
      } else if (progress !== undefined) {
        const { setProgress } = await import('./progress')
        setProgress(video, progress)
      }
    },
  },
})
</script>
<style lang="scss">
@import 'common';
.gesture-preview {
  color: #fff;
  background-color: rgba(0, 0, 0, 0.8);
  font-size: 16px;
  @include round-corner();
  width: 100%;
  height: 100%;
  max-width: 400px;
  max-height: 150px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translateX(-50%) translateY(-50%) scale(0.95);
  opacity: 0;
  transition: 0.2s ease-out;
  display: flex;
  flex-direction: column;
  z-index: 11;
  padding: 4px 6px;
  box-sizing: border-box;
  pointer-events: none;
  &.opened {
    transform: translateX(-50%) translateY(-50%) scale(1);
    opacity: 1;
  }
  &-content {
    @include h-center();
    justify-content: space-between;
    flex: 1 0 auto;
    .brightness,
    .volume {
      position: relative;
      flex: 0 0 auto;
      margin: 0 12px;
      .label {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translateX(-50%) translateY(-50%);
        white-space: nowrap;
        @include v-center();
        .name {
          color: #aaa;
          margin-bottom: 6px;
        }
      }
    }
    .progress {
      @include v-center();
      flex: 1 0 auto;
      align-self: flex-end;
      .videoshot {
        height: 70px;
        width: 120px;
        margin-bottom: 8px;
        border-radius: 4px;
      }
      .name {
        color: #aaa;
        padding: 4px 6px;
        margin-bottom: 6px;
      }
      .progress-label {
        margin-bottom: 12px;
      }
      .preview {
        @include h-center();
        margin-bottom: 6px;
        .diff {
          color: var(--theme-color);
          margin-right: 6px;
        }
        .seek-mode {
          padding: 4px 6px;
          border-radius: 4px;
          background-color: #8884;
        }
      }
    }
  }
}
</style>
