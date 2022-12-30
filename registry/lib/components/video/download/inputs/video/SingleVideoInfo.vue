<template>
  <div class="single-video-info download-video-config-section">
    <img v-if="imageUrl" class="shadow" :src="imageUrl" />
    <img v-if="imageUrl" :src="imageUrl" />
  </div>
</template>
<script lang="ts">
import { videoChange } from '@/core/observer'
import { logError } from '@/core/utils/log'
import { VideoInfo } from '@/components/video/video-info'

export default Vue.extend({
  data() {
    return {
      imageUrl: '',
    }
  },
  created() {
    videoChange(async () => {
      const { aid } = unsafeWindow
      const videoInfo = new VideoInfo(aid)
      try {
        await videoInfo.fetchInfo()
      } catch (error) {
        logError(error)
        throw error
      }
      this.imageUrl = videoInfo.coverUrl.replace('http:', 'https:')
    })
  },
})
</script>
<style lang="scss">
.single-video-info.download-video-config-section {
  position: relative;
  height: 125px;
  display: flex;
  align-items: center;
  justify-content: center;
  img {
    height: 125px;
    object-fit: contain;
    border-radius: 8px;
    &.shadow {
      position: absolute;
      filter: blur(8px) brightness(0.8);
      transform: scaleY(0.95) translateY(4px);
      z-index: -1;
      opacity: 0.3;
    }
  }
}
</style>
