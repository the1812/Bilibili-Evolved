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

<script lang="ts" setup>
import { ref } from 'vue'
import { DefaultWidget } from '@/ui'
import { logError } from '@/core/utils/log'
import { DownloadPackage } from '@/core/download'
import { getFriendlyTitle } from '@/core/utils/title'
import { type MetadataType, generateByType } from './metadata'

const disabled = ref(false)
const run = async (type: MetadataType) => {
  try {
    disabled.value = true
    DownloadPackage.single(`${getFriendlyTitle(true)}.${type}.txt`, await generateByType(type))
  } catch (error) {
    logError(error)
  } finally {
    disabled.value = false
  }
}
</script>
