<template>
  <div class="multiple-widgets">
    <DefaultWidget
      :disabled="disabled"
      name="下载字幕 (JSON)"
      icon="subtitle"
      @click="download('json')"
    ></DefaultWidget>
    <DefaultWidget
      :disabled="disabled"
      name="下载字幕 (ASS)"
      icon="subtitle"
      @click="download('ass')"
    ></DefaultWidget>
  </div>
</template>

<script lang="ts">
import { addData } from '@/plugins/data'
import { DefaultWidget } from '@/ui'
import { logError } from '@/core/utils/log'
import { getFriendlyTitle } from '@/core/utils/title'
import { DownloadPackage } from '@/core/download'
import { SubtitleDownloadType, getBlobByType } from './utils'
import subtitleIcon from './cc-subtitle.svg'

addData('ui.icons', (icons: Record<string, string>) => {
  icons.subtitle = subtitleIcon
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
    async download(type: SubtitleDownloadType) {
      try {
        this.disabled = true
        const blob = await getBlobByType(type)
        DownloadPackage.single(`${getFriendlyTitle(true)}.${type}`, blob)
      } catch (error) {
        logError(error)
      } finally {
        this.disabled = false
      }
    },
  },
})
</script>
