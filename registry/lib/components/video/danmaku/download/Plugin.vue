<template>
  <div class="download-danmaku-config download-video-config-section">
    <div class="download-video-config-item">
      <div class="download-video-config-title">弹幕:</div>
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
import { DanmakuDownloadType } from './utils'

interface Options {
  danmakuType: DanmakuDownloadType | '无'
}
const options = getComponentSettings('downloadVideo').options as Options

export default Vue.extend({
  components: {
    VDropdown,
  },
  data() {
    return {
      type: options.danmakuType ?? '无',
      items: ['无', 'ass', 'json', 'xml'],
    }
  },
  computed: {
    enabled() {
      return this.type !== '无'
    },
  },
  watch: {
    type(newValue: DanmakuDownloadType) {
      options.danmakuType = newValue
    },
  },
})
</script>
<style lang="scss">
.download-danmaku-config.download-video-config-section {
  .be-dropdown {
    text-transform: uppercase;
  }
}
</style>
