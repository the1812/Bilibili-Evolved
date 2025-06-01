<template>
  <div class="download-video-config-section">
    <div class="download-video-config-item">
      <div>元数据：</div>
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
import { VDropdown } from '@/ui'
import { getComponentSettings } from '@/core/settings'
import type { MetadataType } from './metadata'

type Options = {
  metadataType: MetadataType | '无'
}
const { options } = getComponentSettings<Options>('downloadVideo')

const type = ref(options.metadataType ?? '无')
const items = ['无', 'ffmetadata', 'ogm']

watch(type, newValue => {
  options.metadataType = newValue
})
</script>
