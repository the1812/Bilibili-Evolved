<template>
  <DefaultWidget
    :disabled="!imageUrl"
    name="查看封面"
    icon="mdi-image-outline"
    class="view-cover"
    @click="viewCover()"
  ></DefaultWidget>
</template>

<script lang="ts">
import { VideoInfo } from '@/components/video/video-info'
import { logError } from '@/core/utils/log'
import { videoChange } from '@/core/observer'
import { getJson } from '@/core/ajax'
import { select } from '../../../core/spin-query'

export default Vue.extend({
  components: {
    DefaultWidget: () => import('@/widgets/DefaultWidget.vue').then(m => m.default),
  },
  data() {
    return {
      imageUrl: '',
    }
  },
  async mounted() {
    if (!document.URL.includes('live.bilibili.com')) {
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
    } else {
      const coverLink = await select('.header-info-ctnr .room-cover') as HTMLElement
      if (!coverLink) {
        return
      }
      const match = coverLink
        .getAttribute('href')
        .match(/space\.bilibili\.com\/([\d]+)/)
      if (match && match[1]) {
        const uid = match[1]
        const url = `https://api.live.bilibili.com/room/v1/Room/getRoomInfoOld?mid=${uid}`
        const json = await getJson(url)
        this.imageUrl = json.data.cover.replace('http:', 'https:')
      }
    }
  },
  methods: {
    async viewCover() {
      const { showImage } = await import('@/ui/image-viewer')
      showImage(this.imageUrl)
    },
  },
})
</script>

<style lang="scss" scoped>
</style>
