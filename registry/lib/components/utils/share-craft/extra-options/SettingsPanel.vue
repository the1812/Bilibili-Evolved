<template>
  <div class="share-craft-settings">
    <div class="share-craft-field share-craft-field--dropdown">
      <div class="share-craft-field-name">分享模板预设</div>
      <VDropdown :value="draft.preset" :items="presetItems" @change="draft.preset = $event">
        <template #item="{ item }">{{ item }}</template>
      </VDropdown>
    </div>

    <div class="share-craft-template">
      <template v-if="isCustom">
        <div class="share-craft-template-name">自定义模板</div>
        <TextArea
          ref="areaRef"
          :text="draft.customTemplate"
          spellcheck="false"
          autocomplete="off"
          autocorrect="off"
          placeholder="使用 {title}、{up} 等变量"
          @change="draft.customTemplate = $event"
        />
        <div v-if="unknownVariables.length" class="share-craft-template-error">
          未知变量: {{ unknownText }}，复制时会保留原始内容，请检查后再试。
        </div>
        <div class="share-craft-template-tip">
          可用变量: {title} {up} {uid} {up_url} {bv} {av} {url} {short_url} {date} {duration}
          {views} {danmaku} {likes} {coins} {favorites} {replies} {tname} {part} {p} {desc}
          {cover}。
        </div>
      </template>
      <template v-else>
        <div class="share-craft-template-name">当前预设：{{ draft.preset }}（预览）</div>
        <div class="share-craft-template-preview">{{ previewText }}</div>
        <div class="share-craft-template-tip">预设选择「自定义」后可编辑模板内容。</div>
      </template>
    </div>

    <div class="share-craft-field share-craft-field--dropdown">
      <div class="share-craft-field-name">日期格式</div>
      <VDropdown
        :value="draft.dateFormat"
        :items="dateFormatItems"
        @change="draft.dateFormat = $event"
      >
        <template #item="{ item }">{{ item }}</template>
      </VDropdown>
    </div>

    <div class="share-craft-field share-craft-field--dropdown">
      <div class="share-craft-field-name">时长格式</div>
      <VDropdown
        :value="draft.durationFormat"
        :items="durationFormatItems"
        @change="draft.durationFormat = $event"
      >
        <template #item="{ item }">{{ item }}</template>
      </VDropdown>
    </div>

    <div class="share-craft-field share-craft-field--dropdown">
      <div class="share-craft-field-name">播放 / 点赞等数字格式</div>
      <VDropdown
        :value="draft.countFormat"
        :items="countFormatItems"
        @change="draft.countFormat = $event"
      >
        <template #item="{ item }">{{ item }}</template>
      </VDropdown>
    </div>

    <div class="share-craft-field">
      <div class="share-craft-field-name">简介最大长度（0 为不截断）</div>
      <VSlider
        :min="0"
        :max="200"
        :step="10"
        :value="draft.descLength"
        :display-fun="value => String(value)"
        @change="draft.descLength = $event"
      />
    </div>

    <div class="share-craft-field share-craft-field--switch">
      <div class="share-craft-field-name">改写后显示提示</div>
      <SwitchBox :checked="draft.showToast" @change="draft.showToast = $event" />
    </div>

    <div class="share-craft-field share-craft-field--switch">
      <div class="share-craft-field-name">进入视频页后预取信息（首次复制更快）</div>
      <SwitchBox :checked="draft.prefetchInfo" @change="draft.prefetchInfo = $event" />
    </div>

    <div class="share-craft-actions">
      <VButton type="primary" @click.native="save">保存配置</VButton>
      <span v-if="dirty" class="share-craft-dirty">有未保存的修改</span>
      <span v-else-if="showSaved" class="share-craft-saved">已保存</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { SwitchBox, TextArea, VButton, VDropdown, VSlider } from '@/ui'
import { getComponentSettings, settings as globalSettings } from '@/core/settings'
import { Toast } from '@/core/toast'
import type { ComponentMetadata } from '@/components/types'
import {
  CountFormat,
  DateFormat,
  DurationFormat,
  Preset,
  findUnknownVariables,
  presetTemplates,
} from '../templates'

type ShareOptions = {
  preset: Preset
  customTemplate: string
  dateFormat: DateFormat
  durationFormat: DurationFormat
  countFormat: CountFormat
  descLength: number
  showToast: boolean
  prefetchInfo: boolean
}

type TextAreaInstance = {
  $refs?: {
    input?: HTMLTextAreaElement
  }
}

const props = defineProps<{ componentData?: ComponentMetadata }>()
const settings = getComponentSettings<ShareOptions>(props.componentData?.name ?? 'shareCraft')

const draft = reactive<ShareOptions>({
  preset: settings.options.preset,
  customTemplate: settings.options.customTemplate ?? '',
  dateFormat: settings.options.dateFormat,
  durationFormat: settings.options.durationFormat,
  countFormat: settings.options.countFormat,
  descLength: settings.options.descLength,
  showToast: settings.options.showToast,
  prefetchInfo: settings.options.prefetchInfo,
})

const presetItems = Object.values(Preset)
const dateFormatItems = Object.values(DateFormat)
const durationFormatItems = Object.values(DurationFormat)
const countFormatItems = Object.values(CountFormat)

const isCustom = computed(() => draft.preset === Preset.Custom)
const previewText = computed(() => presetTemplates[draft.preset] ?? '')
const unknownVariables = computed(() =>
  isCustom.value ? findUnknownVariables(draft.customTemplate) : [],
)
const unknownText = computed(() => unknownVariables.value.map(name => `{${name}}`).join('、'))

const dirty = computed(() => {
  const o = settings.options
  return (
    draft.preset !== o.preset ||
    draft.customTemplate !== o.customTemplate ||
    draft.dateFormat !== o.dateFormat ||
    draft.durationFormat !== o.durationFormat ||
    draft.countFormat !== o.countFormat ||
    draft.descLength !== o.descLength ||
    draft.showToast !== o.showToast ||
    draft.prefetchInfo !== o.prefetchInfo
  )
})

const areaRef = ref<TextAreaInstance | null>(null)
const showSaved = ref(false)
let savedTimer = 0

const save = () => {
  const input = areaRef.value?.$refs?.input
  if (input) {
    draft.customTemplate = input.value
  }
  const o = settings.options
  o.preset = draft.preset
  o.customTemplate = draft.customTemplate
  o.dateFormat = draft.dateFormat
  o.durationFormat = draft.durationFormat
  o.countFormat = draft.countFormat
  o.descLength = draft.descLength
  o.showToast = draft.showToast
  o.prefetchInfo = draft.prefetchInfo
  try {
    const { GM_setValue } = unsafeWindow.bilibiliEvolved.monkeyApis
    GM_setValue('userComponents', globalSettings.userComponents)
    showSaved.value = true
    window.clearTimeout(savedTimer)
    savedTimer = window.setTimeout(() => {
      showSaved.value = false
    }, 2500)
    Toast.success('配置已保存', '分享文案定制', 2000)
  } catch (error) {
    console.error('[分享文案定制] 保存配置失败', error)
    Toast.error('保存配置失败, 请重试', '分享文案定制', 3000)
  }
}

onBeforeUnmount(() => window.clearTimeout(savedTimer))
</script>
<style lang="scss" scoped>
.share-craft-settings {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}
.share-craft-field {
  display: flex;
  align-items: center;
  min-height: 24px;
}
.share-craft-field-name {
  margin-right: 8px;
}
.share-craft-field--dropdown .share-craft-field-name,
.share-craft-field--switch .share-craft-field-name {
  flex: 1 0 0;
}
.share-craft-field :deep(.be-slider) {
  flex: 1 0 0;
  margin: 0 8px;
}
.share-craft-template {
  display: flex;
  flex-direction: column;
  gap: 6px;
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
.share-craft-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}
.share-craft-dirty {
  font-size: 12px;
  opacity: 0.7;
}
.share-craft-saved {
  font-size: 12px;
  color: #2e7d32;
}
</style>
