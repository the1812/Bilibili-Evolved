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
import { getVideoCoverUrlByAid } from '@/components/video/video-cover'
import { getJson } from '@/core/ajax'
import { videoChange } from '@/core/observer'
import { select } from '@/core/spin-query'
import { showImage, DefaultWidget } from '@/ui'

export default Vue.extend({
  components: {
    DefaultWidget,
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
        this.imageUrl = await getVideoCoverUrlByAid(aid)
      })
    } else {
      const spaceElementSelector = '.header-info-ctnr .room-cover, .header-info-ctnr .avatar'
      const coverLink = (await select(spaceElementSelector)) as HTMLElement
      if (!coverLink) {
        return
      }
      const match = coverLink.getAttribute('href').match(/space\.bilibili\.com\/([\d]+)/)
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
      showImage(this.imageUrl)
    },
  },
})
</script>
