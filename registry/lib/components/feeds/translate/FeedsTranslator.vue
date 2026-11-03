<template>
  <div class="be-feeds-translator" @click.stop>
    <div v-if="!working && !result" v-hit="translate" class="be-feeds-translator-trigger">
      <VIcon :size="14" icon="mdi-earth" />翻译
    </div>
    <div v-if="result" class="be-feeds-translator-toolbar">
      <span>翻译自</span>
      <VDropdown
        :items="providers"
        :value="translatedProvider"
        :key-mapper="item => item.id"
        :disabled="working"
        @change="changeProvider"
      >
        <template #item="{ item }">{{ item.displayName }}</template>
      </VDropdown>
    </div>
    <VIcon v-if="working" :size="18" icon="mdi-loading" class="mdi-spin" />
    <div v-if="error" class="be-feeds-translator-error" v-text="error"></div>
    <div v-if="!working && result" class="be-feeds-translator-result" v-text="result"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import { getComponentSettings } from '@/core/settings'
import { AIProvider, getAIProvider, getAIProviders } from '@/core/ai'
import { AITranslateProvider } from '@/core/translate'
import { VDropdown, VIcon } from '@/ui'
import { FeedsTranslateOptions, getTargetLanguage } from './options'
import { protectFeedsText } from './text'

const props = defineProps<{
  text: string
}>()

const providers = computed(getAIProviders)
const working = ref(false)
const result = ref('')
const error = ref('')
const translatedProvider = shallowRef<AIProvider | null>(null)

const translate = async () => {
  if (working.value) {
    return
  }
  working.value = true
  error.value = ''
  const { providerId, targetLanguage } =
    getComponentSettings<FeedsTranslateOptions>('feedsTranslate').options
  try {
    const provider = getAIProvider(providerId)
    const translator = new AITranslateProvider(provider)
    const protectedText = protectFeedsText(props.text)
    const translatedText = await translator.translate(protectedText.text, {
      targetLanguage: getTargetLanguage(targetLanguage),
      instruction: '【硬性要求】原样保留所有 {{TRANSLATE_PLACEHOLDER_*}} 占位符，保留原有换行。',
    })
    result.value = protectedText.restore(translatedText)
    translatedProvider.value = provider
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    working.value = false
  }
}

const changeProvider = async (provider: AIProvider) => {
  if (working.value) {
    return
  }
  getComponentSettings<FeedsTranslateOptions>('feedsTranslate').options.providerId = provider.id
  await translate()
}
</script>

<style lang="scss">
@import 'common';

.be-feeds-translator {
  margin-top: 12px;
  font-size: 14px;
  font-weight: normal;
  line-height: 1.6;
  text-align: left;
  color: inherit;

  &-trigger {
    @include h-center(2px);
    font-size: 12px;
    height: 18px;
    color: var(--be-color-text-placeholder, #888);
    cursor: pointer;

    &:hover {
      color: var(--theme-color);
    }
  }

  &-toolbar {
    @include h-center(8px);
    flex-wrap: wrap;
    font-size: 12px;
    color: var(--be-color-text-placeholder, #888);
  }

  &-result,
  &-error {
    margin-top: 6px;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  &-error {
    color: #e57373;
  }
}
</style>
