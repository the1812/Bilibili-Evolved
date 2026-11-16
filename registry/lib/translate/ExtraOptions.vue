<template>
  <div class="translate-provider-option">
    <div>翻译模型</div>
    <VDropdown
      :items="providers"
      :value="selectedProvider"
      :key-mapper="item => item.id"
      @change="changeProvider"
    >
      <template #item="{ item }">{{ item.displayName }}</template>
    </VDropdown>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { AIProvider, getAIProviders } from '@/core/ai'
import {
  addComponentListener,
  getComponentSettings,
  removeComponentListener,
} from '@/core/settings'
import { VDropdown } from '@/ui'
import { TranslateOptions } from './options'

const props = defineProps<{ componentName: string }>()
const { options } = getComponentSettings<TranslateOptions>(props.componentName)
const providerPath = `${props.componentName}.providerId`
const providerId = ref(options.providerId)
const providers = computed(getAIProviders)
const selectedProvider = computed(
  () =>
    providers.value.find(item => item.id === providerId.value) ?? {
      id: providerId.value,
      displayName: `配置已删除 (${providerId.value})`,
    },
)
const updateProviderId = (id: string) => {
  providerId.value = id
}
addComponentListener(providerPath, updateProviderId)
onBeforeUnmount(() => removeComponentListener(providerPath, updateProviderId))

const changeProvider = (provider: AIProvider) => {
  options.providerId = provider.id
}
</script>

<style lang="scss">
@import 'common';

.translate-provider-option {
  @include h-center(8px);
  justify-content: space-between;
}
</style>
