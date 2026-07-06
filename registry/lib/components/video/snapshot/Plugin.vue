<template>
  <div class="download-cover-config download-video-config-section" style="display: flex">
    <div class="download-video-config-title">视频快照图：</div>
    <SwitchBox v-model="enabled" />
  </div>
</template>
<script lang="ts">
import { getComponentSettings } from '@/core/settings'
import { UnknownOptions } from '@/components/component'
import { SwitchBox } from '@/ui'

interface Options extends UnknownOptions {
  videoSnapshotGrid: boolean
}
const { options } = getComponentSettings<Options>('downloadVideo')

export default Vue.extend({
  components: {
    SwitchBox,
  },
  data() {
    return {
      enabled: !!options.videoSnapshotGrid,
    }
  },
  watch: {
    enabled(enabled: boolean) {
      options.videoSnapshotGrid = enabled
    },
  },
})
</script>
