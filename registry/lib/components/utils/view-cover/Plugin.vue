<template>
  <div class="download-cover-config download-video-config-section">
    <div class="download-video-config-item">
      <div class="download-video-config-title">封面:</div>
      <VDropdown v-model:value="type" :items="items">
        <template #item="{ item }">
          {{ item }}
        </template>
      </VDropdown>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, watch } from 'vue'
import { getComponentSettings } from '@/core/settings'
import type { UnknownOptions } from '@/components/component'
import { VDropdown } from '@/ui'
import type { CoverDownloadType } from './types'

interface Options extends UnknownOptions {
  CoverType: CoverDownloadType | '无'
}
const { options } = getComponentSettings<Options>('downloadVideo')

const type = ref(options.CoverType ?? '无')
const items = ['无', 'jpg']
watch(type, newValue => {
  options.CoverType = newValue
})
</script>
<style lang="scss">
.download-cover-config.download-video-config-section {
  .be-dropdown {
    text-transform: uppercase;
  }
}
</style>
