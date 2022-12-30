<template>
  <div class="download-subtitle-config download-video-config-section">
    <div class="download-video-config-item">
      <div class="download-video-config-title">字幕:</div>
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
import { VDropdown } from '@/ui'
import { SubtitleDownloadType } from './utils'

interface Options {
  subtitleType: SubtitleDownloadType | '无'
}
const options = getComponentSettings('downloadVideo').options as Options

export default Vue.extend({
  components: {
    VDropdown,
  },
  data() {
    return {
      type: options.subtitleType ?? '无',
      items: ['无', 'ass', 'json'],
    }
  },
  computed: {
    enabled() {
      return this.type !== '无'
    },
  },
  watch: {
    type(newValue: SubtitleDownloadType) {
      options.subtitleType = newValue
    },
  },
})
</script>
<style lang="scss">
.download-subtitle-config.download-video-config-section {
  .be-dropdown {
    text-transform: uppercase;
  }
}
</style>
