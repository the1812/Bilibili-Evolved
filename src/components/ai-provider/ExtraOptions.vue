<template>
  <div class="ai-provider-options">
    <div class="ai-provider-title">模型配置</div>
    <div class="ai-provider-list">
      <div v-for="provider of providers" :key="provider.id" class="ai-provider-row">
        <AIProviderEditor
          v-if="editingConfig && editingConfig.id === provider.id"
          :config="editingConfig"
          @close="editingConfig = undefined"
        />
        <div v-else class="ai-provider-row-content">
          <div class="ai-provider-info">
            <div :title="provider.id">{{ provider.displayName }}</div>
          </div>
          <template v-if="findCustomConfig(provider.id)">
            <VButton
              icon
              type="transparent"
              title="编辑模型"
              @click="editingConfig = findCustomConfig(provider.id)"
            >
              <VIcon icon="mdi-pencil-outline" :size="16" />
            </VButton>
            <VButton
              icon
              type="transparent"
              title="删除模型"
              @click="deleteAIProviderConfig(provider.id)"
            >
              <VIcon icon="mdi-trash-can-outline" :size="16" />
            </VButton>
          </template>
          <div v-else-if="isBuiltIn(provider.id)" class="ai-provider-hint ai-provider-row-hint">
            内置
          </div>
        </div>
      </div>
    </div>
    <AIProviderEditor v-if="adding" @close="adding = false" />
    <VButton v-else class="ai-provider-add" @click="adding = true">添加模型</VButton>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import { AIProviderConfig, deleteAIProviderConfig, getAIProviders } from '@/core/ai'
import { builtInAIProviderConfigs } from '@/core/ai/presets'
import { getComponentSettings } from '@/core/settings'
import { VButton, VIcon } from '@/ui'
import AIProviderEditor from './AIProviderEditor.vue'
import { AIProviderOptions } from './options'
import type { ComponentMetadata } from '../types'

defineProps<{ componentData: ComponentMetadata }>()

const providers = computed(getAIProviders)
const adding = ref(false)
const editingConfig = shallowRef<AIProviderConfig>()
const findCustomConfig = (id: string) =>
  getComponentSettings<AIProviderOptions>('ai-provider').options.providers.find(
    item => item.id === id,
  )
const isBuiltIn = (id: string) => builtInAIProviderConfigs.some(item => item.id === id)
</script>

<style lang="scss">
@import 'common';

.ai-provider-options {
  @include v-stretch(8px);
  padding: 4px 0;
  min-width: 0;

  .ai-provider-row-content {
    @include h-center();
  }

  .ai-provider-row {
    padding-bottom: 4px;
    border-bottom: 1px solid var(--be-color-card-border, #8882);
    .ai-provider-editor {
      padding: 4px 0;
    }
  }

  .ai-provider-info {
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .ai-provider-list {
    @include v-stretch(4px);
    padding: 4px 0;
  }

  .ai-provider-hint {
    font-size: 12px;
    color: var(--be-color-text-placeholder, #888);
  }

  .ai-provider-row-hint {
    padding: 4px 0;
  }
}
</style>
