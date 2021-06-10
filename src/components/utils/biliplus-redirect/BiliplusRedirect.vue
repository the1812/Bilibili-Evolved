<template>
  <a :href="url" target="_blank" tabindex="-1">
    <DefaultWidget name="转到BiliPlus" icon="biliplus" :disabled="disabled"></DefaultWidget>
  </a>
</template>

<script lang="ts">
import { videoChange } from '@/core/observer'

export default Vue.extend({
  components: {
    DefaultWidget: () => import('@/widgets/DefaultWidget.vue').then(m => m.default),
  },
  data() {
    return {
      url: '',
      disabled: false,
    }
  },
  created() {
    const host = 'www.biliplus.com'
    if (window.location.host === 'space.bilibili.com') {
      this.url = document.URL.replace('space.bilibili.com/', `${host}/space/`)
    } else if (document.URL.includes('/bangumi/')) {
      videoChange(() => {
        const aid = unsafeWindow.aid || (() => {
          const link = document.querySelector('.av-link,.info-sec-av') as HTMLElement
          return link.innerText.replace(/[aAvV]/g, '')
        })()
        const url = `https://${host}/video/av${aid}/`
        if (document.URL !== url) {
          this.href = url
        } else {
          this.disabled = true
        }
      })
      return
    } else {
      this.url = document.URL.replace(window.location.host, host)
    }

    this.disabled = (document.URL === this.url)
  },
})
</script>
