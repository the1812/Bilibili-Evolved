<template>
  <div class="ai-provider-editor">
    <div class="ai-provider-field">
      <div>模型</div>
      <TextBox v-model="draft.model" placeholder="模型名称" />
    </div>
    <div class="ai-provider-field">
      <div>显示名称</div>
      <TextBox v-model="draft.displayName" placeholder="模型显示名称" />
    </div>
    <div class="ai-provider-field">
      <div>API 地址</div>
      <TextBox v-model="draft.baseUrl" placeholder="https://example.com/v1" />
    </div>
    <div class="ai-provider-field ai-provider-parameters">
      <div>参数</div>
      <TextArea v-model="draft.parameters" :placeholder="'key=value\nobj.key=value'" rows="7" />
    </div>
    <div v-if="error" class="ai-provider-error">{{ error }}</div>
    <div class="ai-provider-actions">
      <VButton @click="emit('close')">取消</VButton>
      <VButton type="primary" @click="save">保存</VButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { AIProviderConfig, getAIProviderParameters, setAIProviderConfig } from '@/core/ai'
import { getRandomId } from '@/core/utils'
import { TextArea, TextBox, VButton } from '@/ui'

const props = defineProps<{ config?: AIProviderConfig }>()
const emit = defineEmits<{ (event: 'close'): void }>()
const { config } = props
const draft = reactive<AIProviderConfig>(
  config
    ? { ...config, parameters: getAIProviderParameters(config) }
    : { id: getRandomId(16), displayName: '', baseUrl: '', model: '', parameters: '' },
)
const error = ref('')

const save = () => {
  try {
    setAIProviderConfig(draft)
    emit('close')
  } catch (e) {
    error.value = (e as Error).message
  }
}
</script>

<style lang="scss">
@import 'common';

.ai-provider-editor {
  @include v-stretch(12px);

  .ai-provider-field,
  .ai-provider-actions {
    @include h-center(8px);
  }

  .ai-provider-field > :first-child {
    width: 64px;
    flex-shrink: 0;
  }

  .ai-provider-parameters {
    align-items: flex-start;

    textarea {
      min-height: 140px;
    }
  }

  .ai-provider-actions {
    justify-content: end;
  }

  .ai-provider-error {
    color: #e57373;
  }
}
</style>
