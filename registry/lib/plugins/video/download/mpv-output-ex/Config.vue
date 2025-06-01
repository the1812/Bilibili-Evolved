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
<script lang="ts" setup>
import { ref } from 'vue'
import { getComponentSettings } from '@/core/settings'
import { TextBox } from '@/ui'

const { options } = getComponentSettings<ConfigDataType>('downloadVideo')

const api_dev_key = ref(options.api_dev_key || '')
const api_user_key = ref(options.api_user_key || '')

const onChange = () => {
  Object.assign(options, {
    api_dev_key: api_dev_key.value,
    api_user_key: api_user_key.value,
  })
}
</script>
<style lang="scss">
@import 'common';

.mpv-ex.config {
  align-self: stretch;
  @include v-stretch(12px);
  > .config-item {
    @include h-center(8px);
  }
}
</style>
