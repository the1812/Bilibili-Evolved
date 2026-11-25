<template>
  <div class="share-craft-template">
    <template v-if="isCustom">
      <div class="share-craft-template-name">自定义模板（当前使用此模板）</div>
      <TextArea
        :text="template"
        change-on-blur
        spellcheck="false"
        autocomplete="off"
        autocorrect="off"
        placeholder="使用 {title}、{up} 等变量"
        @change="onChange"
      />
      <div v-if="unknownVariables.length" class="share-craft-template-error">
        未知变量: {{ unknownText }}，复制时会保留原始内容，请检查后再试。
      </div>
      <div class="share-craft-template-tip">
        可用变量: {title} {up} {uid} {up_url} {bv} {av} {url} {short_url} {date} {duration} {views}
        {danmaku} {likes} {coins} {favorites} {replies} {tname} {part} {p} {desc} {cover}。
      </div>
    </template>
    <template v-else>
      <div class="share-craft-template-name">当前预设：{{ preset }}（预览）</div>
      <div class="share-craft-template-preview">{{ previewText }}</div>
      <div class="share-craft-template-tip">预设选择「自定义」后可编辑模板内容。</div>
    </template>
  </div>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { TextArea } from '@/ui'
import {
  addComponentListener,
  getComponentSettings,
  removeComponentListener,
} from '@/core/settings'
import type { ComponentMetadata } from '@/components/types'
import { Preset, findUnknownVariables, presetTemplates } from '../templates'

type TemplateOptions = {
  preset: Preset
  customTemplate: string
}

const props = defineProps<{ componentData?: ComponentMetadata }>()
const componentName = props.componentData?.name ?? 'shareCraft'
const settings = getComponentSettings<TemplateOptions>(componentName)

const preset = ref(settings.options.preset)
const template = ref(settings.options.customTemplate ?? '')
const isCustom = computed(() => preset.value === Preset.Custom)
const previewText = computed(() => presetTemplates[preset.value] ?? '')
const unknownVariables = computed(() =>
  isCustom.value ? findUnknownVariables(template.value) : [],
)
const unknownText = computed(() => unknownVariables.value.map(name => `{${name}}`).join('、'))

const presetListener = (value: Preset) => {
  preset.value = value
}
addComponentListener<Preset>(`${componentName}.preset`, presetListener)
onBeforeUnmount(() => removeComponentListener(`${componentName}.preset`, presetListener))

const onChange = (value: string) => {
  settings.options.customTemplate = value
  template.value = value
}
</script>
<style lang="scss" scoped>
.share-craft-template {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
}
.share-craft-template-name {
  font-weight: 600;
}
.share-craft-template :deep(.be-text-area) {
  flex: 1 0 auto;
  min-height: 96px;
}
.share-craft-template-preview {
  padding: 4px 6px;
  border-radius: 4px;
  box-shadow: 0 0 0 1px #8884;
  font-size: inherit;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
  user-select: text;
}
.share-craft-template-tip {
  font-size: 12px;
  line-height: 1.5;
  opacity: 0.7;
}
.share-craft-template-error {
  font-size: 12px;
  line-height: 1.5;
  color: #f56c6c;
}
</style>
