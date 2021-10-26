<template>
  <a :href="url" target="_blank" tabindex="-1">
    <DefaultWidget name="转到BiliPlus" icon="biliplus" :disabled="!url" />
  </a>
</template>

<script lang="ts">
import { videoChange } from '@/core/observer'
import { DefaultWidget } from '@/ui'

export default Vue.extend({
  components: {
    DefaultWidget,
  },
  data() {
    return {
      url: '',
    }
  },
  created() {
    const host = 'www.biliplus.com'
    const videoRegex = /\/video\/(av[\d]+|BV.+)/i
    if (window.location.host === 'space.bilibili.com') {
      this.url = document.URL.replace('space.bilibili.com/', `${host}/space/`)
    } else if (document.URL.includes('/bangumi/play')) {
      this.url = `https://${host}${window.location.pathname}${window.location.search}`
      videoChange(() => {
        const aid = unsafeWindow.aid || (() => {
          const link = document.querySelector('.av-link,.info-sec-av') as HTMLElement
          return link.innerText.replace(/[aAvV]/g, '')
        })()
        const url = `https://${host}/video/av${aid}/`
        if (document.URL !== url) {
          this.href = url
        } else {
          this.href = ''
        }
      })
    } else if (videoRegex.test(document.URL)) {
      const [, id] = document.URL.match(videoRegex)
      this.url = `https://${host}/video/${id}/`
    } else {
      videoChange(() => {
        this.url = document.URL.replace(window.location.host, host)
      })
    }
  },
})
</script>
