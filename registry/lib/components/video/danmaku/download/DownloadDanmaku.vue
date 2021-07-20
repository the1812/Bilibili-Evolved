<template>
  <div class="multiple-widgets">
    <DefaultWidget
      :disabled="disabled"
      name="下载弹幕 (XML)"
      icon="danmaku"
      @click="download('xml')"
    ></DefaultWidget>
    <DefaultWidget
      :disabled="disabled"
      name="下载弹幕 (JSON)"
      icon="danmaku"
      @click="download('json')"
    ></DefaultWidget>
    <DefaultWidget
      :disabled="disabled"
      name="下载弹幕 (ASS)"
      icon="danmaku"
      @click="download('ass')"
    ></DefaultWidget>
  </div>
</template>

<script lang="ts">
import { DownloadPackage } from '@/core/download'
import { logError } from '@/core/utils/log'
import { getFriendlyTitle } from '@/core/utils/title'
import { addData } from '@/plugins/data'
import { DefaultWidget } from '@/ui'
import danmakuIcon from './danmaku.svg'
import { DanmakuDownloadType, getBlobByType } from './utils'

addData('ui.icons', (icons: { [key: string]: string }) => {
  icons.danmaku = danmakuIcon
})

export default Vue.extend({
  components: {
    DefaultWidget,
  },
  data() {
    return {
      disabled: false,
    }
  },
  methods: {
    async download(type: DanmakuDownloadType) {
      try {
        this.disabled = true
        const title = getFriendlyTitle()
        const blob = await getBlobByType(type)
        await DownloadPackage.single(`${title}.${type}`, blob)
      } catch (error) {
        logError(error)
      } finally {
        this.disabled = false
      }
    },
  },
})
</script>
