<template>
  <DefaultWidget
    :disabled="downloading"
    name="下载up主表情包"
    icon="mdi-emoticon-outline"
    @click="download()"
  ></DefaultWidget>
</template>

<script lang="ts">
import { DefaultWidget } from '@/ui'
import { logError } from '@/core/utils/log'
import { Emoticons } from './emoticons'
import { DownloadPackage } from '@/core/download'
import { Toast } from '@/core/toast'

const downloader = new Emoticons()

export default Vue.extend({
  components: {
    DefaultWidget,
  },
  data() {
    return {
      downloading: false,
      midRegex: /mid=(\d+)/,
      roomIdRegex: /^https:\/\/live\.bilibili\.com\/(\d+)(?:\?.*)?$/,
    }
  },
  methods: {
    async download() {
      this.downloading = true
      try {
        const url = window.location.href
        if (url.startsWith('https://live.bilibili.com/')) {
          const rid = this.roomIdRegex.exec(url)[1]
          const emoticonsArray = await downloader.getEmoticonsArray(rid)
          if (emoticonsArray.length === 0) {
            Toast.info('该up主没有专属表情包', '表情包下载')
            return
          }
          const downloadPromises = await downloader.downloadEmoticons(emoticonsArray)
          const results = await downloader.batchDownload(downloadPromises)
          const dpackage = new DownloadPackage()
          dpackage.noEscape = true
          for (const result of results) {
            if (result !== null) {
              for (const emoticon of result.emoticons) {
                dpackage.add(`${result.pkg_name}/${emoticon.emoji}.png`, emoticon.blob)
              }
            }
          }
          await dpackage.emit(`emoticons-${rid}.zip`)
        }
      } catch (error) {
        Toast.error('下载失败详情查看控制台', '表情包下载')
        logError(error)
      } finally {
        this.downloading = false
      }
    },
  },
})
</script>
