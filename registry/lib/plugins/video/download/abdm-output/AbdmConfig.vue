<template>
  <div class="abdm-config download-video-config-section">
    <div class="config-host">
      <div class="config-item-name">主机:</div>
      <TextBox v-model="abdmConfig.host" change-on-blur />
    </div>
    <div class="config-port">
      <div class="config-item-name">端口:</div>
      <TextBox v-model="abdmConfig.port" change-on-blur />
    </div>
  </div>
</template>
<script lang="ts">
import { getComponentSettings } from '@/core/settings'
import { TextBox } from '@/ui'

interface AbdmConfig {
  host: string
  port: string
}

const { options: storedOptions } = getComponentSettings('downloadVideo')
const defaultConfig: AbdmConfig = {
  host: 'localhost',
  port: '15151',
}
const abdmConfig = { ...defaultConfig, ...storedOptions.abdmConfig }

export default Vue.extend({
  components: {
    TextBox,
  },
  data() {
    return {
      abdmConfig,
    }
  },
  watch: {
    abdmConfig: {
      handler() {
        storedOptions.abdmConfig = this.abdmConfig
      },
      deep: true,
    },
  },
})
</script>
<style lang="scss">
@import 'common';
.abdm-config.download-video-config-section {
  @include v-center();
  align-items: stretch;
  > * {
    @include h-center();
    &:not(:last-child) {
      margin-bottom: 12px;
    }
  }
  .config-item-name {
    margin-right: 8px;
  }
}
</style>
