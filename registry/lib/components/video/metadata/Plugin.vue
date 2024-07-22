<template>
  <div class="download-video-config-section">
    <div class="download-video-config-item">
      <div>保存元数据：</div>
      <SwitchBox v-model="saveMetadata" />
    </div>
  </div>
</template>
<script lang="ts">
import { SwitchBox } from '@/ui'
import { getComponentSettings } from '@/core/settings'

interface Options {
  saveMetadata: boolean
}
const options = getComponentSettings('downloadVideo').options as Options

export default Vue.extend({
  components: {
    SwitchBox,
  },
  data() {
    return {
      saveMetadata: options.saveMetadata,
    }
  },
  watch: {
    saveMetadata(saveMetadata: boolean) {
      options.saveMetadata = saveMetadata
    },
  },
})
</script>
