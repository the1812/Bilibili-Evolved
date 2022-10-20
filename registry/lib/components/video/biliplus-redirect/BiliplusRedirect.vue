<template>
  <a :href="url" target="_blank" tabindex="-1">
    <DefaultWidget name="转到BiliPlus" icon="biliplus" :disabled="!url" />
  </a>
</template>

<script lang="ts">
import { videoChange } from '@/core/observer'
import { DefaultWidget } from '@/ui'

const videoRegex = /\/(video|medialist\/play)\/([^\/]+\/)?(av[\d]+|BV.+)/i
interface BiliplusRedirectProvider {
  condition: () => boolean
  getUrl: (host: string, updateUrl: (url: string) => void) => string
}
const redirectProviders: BiliplusRedirectProvider[] = [
  {
    condition: () => window.location.host === 'space.bilibili.com',
    getUrl: host => document.URL.replace('space.bilibili.com/', `${host}/space/`),
  },
  {
    condition: () => window.location.host === 'space.bilibili.com',
    getUrl: host => document.URL.replace('space.bilibili.com/', `${host}/space/`),
  },
  {
    condition: () => document.URL.includes('/bangumi/play'),
    getUrl: (host, updateUrl) => {
      videoChange(() => {
        const aid =
          unsafeWindow.aid ||
          (() => {
            const link = document.querySelector('.av-link,.info-sec-av') as HTMLElement
            return link.innerText.replace(/[aAvV]/g, '')
          })()
        const url = `https://${host}/video/av${aid}/`
        if (document.URL !== url) {
          updateUrl(url)
        } else {
          updateUrl('')
        }
      })
      return `https://${host}${window.location.pathname}${window.location.search}`
    },
  },
  {
    condition: () => videoRegex.test(document.URL),
    getUrl: host => {
      const id = document.URL.match(videoRegex)[3]
      return `https://${host}/video/${id}/`
    },
  },
]
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
    const updateUrl = (url: string) => (this.url = url)
    const provider = redirectProviders.find(p => p.condition())
    if (provider) {
      updateUrl(provider.getUrl(host, updateUrl))
    } else {
      videoChange(() => {
        this.url = document.URL.replace(window.location.host, host)
      })
    }
  },
})
</script>
