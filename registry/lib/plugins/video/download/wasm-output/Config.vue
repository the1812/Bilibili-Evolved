<template>
  <div v-if="shouldShow" class="download-video-config-item" style="flex-wrap: wrap">
    <div class="download-video-config-title">写入元数据：</div>
    <SwitchBox v-model="muxWithMetadata" @change="saveOptions" />
    <div class="download-video-config-description" style="width: 100%">
      仅支持元数据类型「ffmetadata」
    </div>
  </div>
</template>

<script lang="ts">
import { SwitchBox } from '@/ui'
import { isComponentEnabled, getComponentSettings } from '@/core/settings'

interface Options {
  muxWithMetadata: boolean
}
const defaultOptions: Options = {
  muxWithMetadata: false,
}
const { options: storedOptions } = getComponentSettings('downloadVideo')
const options: Options = { ...defaultOptions, ...storedOptions }
export default Vue.extend({
  components: {
    SwitchBox,
  },
  data() {
    const shouldShow = isComponentEnabled('saveVideoMetadata')
    return {
      shouldShow,
      muxWithMetadata: shouldShow && options.muxWithMetadata,
    }
  },
  methods: {
    saveOptions() {
      options.muxWithMetadata = this.muxWithMetadata
      Object.assign(storedOptions, options)
    },
  },
})
</script>
