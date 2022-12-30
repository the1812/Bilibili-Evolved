<template>
  <DefaultWidget
    :disabled="disabled || downloading"
    :name="progress || '下载音频'"
    icon="mdi-download"
    @click="download()"
  ></DefaultWidget>
</template>

<script lang="ts">
import { select } from '@/core/spin-query'
import { childList } from '@/core/observer'
import { DownloadPackage } from '@/core/download'
import { DefaultWidget } from '@/ui'
import { AudioDownloader } from './audio-downloader'

export default Vue.extend({
  components: {
    DefaultWidget,
  },
  data() {
    return {
      progress: '',
      disabled: true,
      downloader: new AudioDownloader(),
      downloading: false,
    }
  },
  async mounted() {
    const app = await select('#app')
    const downloader = this.downloader as AudioDownloader
    downloader.progress = progress => {
      this.progress = `${Math.round(progress)}%`
    }
    childList(app, () => {
      const match = document.URL.match(/bilibili\.com\/audio\/au([\d]+)/)
      if (match && match[1]) {
        this.disabled = false
        ;[, downloader.sid] = match
      } else {
        this.disabled = true
      }
    })
  },
  methods: {
    async download() {
      if (this.downloading) {
        return
      }
      this.downloading = true
      try {
        const downloader = this.downloader as AudioDownloader
        if (downloader.sid === null) {
          return
        }
        const blob = await downloader.download()
        const filename = `${(() => {
          const title = document.querySelector('.song-title')
          if (title) {
            return title.getAttribute('title')
          }
          return '神秘音频'
        })()}.mp3`
        this.progress = ''
        await DownloadPackage.single(filename, blob)
      } finally {
        this.downloading = false
      }
    },
  },
})
</script>
