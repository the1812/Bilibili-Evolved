<template>
  <div class="download-cover-config download-video-config-section">
    <div class="download-video-config-item">
      <div class="download-video-config-title">封面:</div>
      <VDropdown v-model="type" :items="items">
        <template #item="{ item }">
          {{ item }}
        </template>
      </VDropdown>
    </div>
  </div>
</template>
<script lang="ts">
import { getComponentSettings } from '@/core/settings'
import { UnknownOptions } from '@/components/component'
import { VDropdown } from '@/ui'
import { CoverDownloadType } from './types'

interface Options extends UnknownOptions {
  CoverType: CoverDownloadType | '无'
}
const { options } = getComponentSettings<Options>('downloadVideo')

export default Vue.extend({
  components: {
    VDropdown,
  },
  data() {
    return {
      type: options.CoverType ?? '无',
      items: ['无', 'jpg'],
    }
  },
  computed: {
    enabled() {
      return this.type !== '无'
    },
  },
  watch: {
    type(newValue: CoverDownloadType) {
      options.CoverType = newValue
    },
  },
})
</script>
<style lang="scss">
.download-cover-config.download-video-config-section {
  .be-dropdown {
    text-transform: uppercase;
  }
}
</style>
