<template>
  <div class="download-video-config-section">
    <div class="download-video-config-item">
      <div>元数据：</div>
      <VDropdown v-model="type" :items="items">
        <template #item="{ item }">
          {{ item }}
        </template>
      </VDropdown>
    </div>
  </div>
</template>
<script lang="ts">
import { VDropdown } from '@/ui'
import { getComponentSettings } from '@/core/settings'
import { MetadataType } from './metadata'

interface Options {
  metadataType: MetadataType | '无'
}
const options = getComponentSettings('downloadVideo').options as Options

export default Vue.extend({
  components: {
    VDropdown,
  },
  data() {
    return {
      type: options.metadataType ?? '无',
      items: ['无', 'ffmetadata', 'ogm'],
    }
  },
  computed: {
    enabled() {
      return this.type !== '无'
    },
  },
  watch: {
    type(value: MetadataType) {
      options.metadataType = value
    },
  },
})
</script>
