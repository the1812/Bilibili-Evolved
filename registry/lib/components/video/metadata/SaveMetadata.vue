<template>
  <div class="multiple-widgets">
    <DefaultWidget
      ref="button"
      :disabled="disabled"
      name="保存视频元数据"
      icon="mdi-download"
      @click="run('ffmetadata')"
    ></DefaultWidget>
    <DefaultWidget
      :disabled="disabled"
      name="保存视频章节"
      icon="mdi-download"
      @click="run('ogm')"
    ></DefaultWidget>
  </div>
</template>

<script lang="ts">
import { DefaultWidget } from '@/ui'
import { logError } from '@/core/utils/log'
import { DownloadPackage } from '@/core/download'
import { getFriendlyTitle } from '@/core/utils/title'
import { MetadataType, generateByType } from './metadata'

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
    async run(type: MetadataType) {
      try {
        this.disabled = true
        DownloadPackage.single(`${getFriendlyTitle(true)}.${type}.txt`, await generateByType(type))
      } catch (error) {
        logError(error)
      } finally {
        this.disabled = false
      }
    },
  },
})
</script>
