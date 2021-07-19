<template>
  <div class="video-take-screenshot" title="截图" @click="takeScreenshot">
    <span>
      <VIcon icon="mdi-camera" :size="20"></VIcon>
    </span>
  </div>
</template>

<script lang="ts">
import { mountVueComponent } from '@/core/utils'
import { Screenshot, takeScreenshot } from './screenshot'
import ScreenshotContainer from './VideoScreenshotContainer.vue'

let screenShotsList: Vue & {
  screenshots: Screenshot[]
}
export default Vue.extend({
  components: {
    VIcon: () => import('@/ui/icon/VIcon.vue').then(m => m.default),
  },
  methods: {
    async takeScreenshot(e: MouseEvent) {
      const { select } = await import('@/core/spin-query')
      const video = (await select('.bilibili-player-video video')) as HTMLVideoElement
      const screenshot = takeScreenshot(video, e.shiftKey)
      if (!screenShotsList) {
        screenShotsList = mountVueComponent(ScreenshotContainer)
        document.body.insertAdjacentElement('beforeend', screenShotsList.$el)
      }
      screenShotsList.screenshots.unshift(screenshot)
    },
  },
})
</script>

<style lang="scss">
.video-take-screenshot {
  display: flex;
  padding: 0 4px 0 12px;
  height: 22px;
  color: #f2f2f2;
  cursor: pointer;
  .video-screenshot-disable & {
    display: none;
  }
  .player-mode-fullscreen &,
  .player-mode-webfullscreen & {
    height: 32px;
    .be-icon {
      $size: 24px;
      font-size: $size;
      width: $size;
      height: $size;
    }
  }
  body.touch-player-control & {
    height: 100%;
    align-items: flex-start;
    padding: 1px 6px 0 14px;
  }
  body.touch-player-control.player-mode-fullscreen &,
  body.touch-player-control.player-mode-webfullscreen & {
    height: 100%;
    padding-top: 5px;
  }
  > span {
    align-items: center;
    display: inline-flex;
  }
}
.bilibili-player-video-control-bottom-center {
  padding-left: 14px !important;
}
</style>
