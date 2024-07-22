<template>
  <div class="multiple-widgets">
    <DefaultWidget
      ref="button"
      :disabled="disabled"
      name="保存视频元数据"
      icon="mdi-download"
      @click="run()"
    ></DefaultWidget>
  </div>
</template>

<script lang="ts">
import { DefaultWidget } from '@/ui'
import { logError } from '@/core/utils/log'
import { DownloadPackage } from '@/core/download'
import { getFriendlyTitle } from '@/core/utils/title'
import { generateFFMetadataBlob } from './metadata'

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
    async run() {
      try {
        this.disabled = true
        DownloadPackage.single(
          `${getFriendlyTitle(true)}.ffmetadata.txt`,
          await generateFFMetadataBlob(),
        )
      } catch (error) {
        logError(error)
      } finally {
        this.disabled = false
      }
    },
  },
})
</script>
