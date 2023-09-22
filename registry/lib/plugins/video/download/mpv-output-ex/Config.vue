<template>
  <div class="mpv-ex config">
    <div class="config-item">
      <span class="item-name">api_dev_key:</span>
      <TextBox v-model="api_dev_key" @blur="onChange" />
    </div>
    <div class="config-item">
      <span class="item-name">api_user_key:</span>
      <TextBox v-model="api_user_key" @blur="onChange" />
    </div>
  </div>
</template>
<script lang="ts">
import { getComponentSettings } from '@/core/settings'
import { TextBox } from '@/ui'

const { options } = getComponentSettings<ConfigDataType>('downloadVideo')

export default Vue.extend<ConfigDataType>({
  components: {
    TextBox,
  },
  data() {
    return {
      ...lodash.pick(options, ['api_dev_key', 'api_user_key']),
    }
  },
  methods: {
    onChange() {
      Object.assign(options, lodash.pick(this, ['api_dev_key', 'api_user_key']))
    },
  },
})
</script>
<style lang="scss">
@import 'common';

.mpv-ex.config {
  align-self: stretch;
  @include v-stretch(12px);
  > .config-item {
    @include h-center(8px);
    > .item-name {
    }
  }
}
</style>
