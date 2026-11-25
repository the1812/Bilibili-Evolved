<template>
  <div class="share-craft-settings">
    <section class="share-craft-section">
      <div class="share-craft-section-title">模板</div>
      <div class="share-craft-row">
        <span class="share-craft-label">预设</span>
        <VDropdown :value="draft.preset" :items="presetItems" @change="draft.preset = $event">
          <template #item="{ item }">{{ item }}</template>
        </VDropdown>
      </div>

      <template v-if="isCustom">
        <TextArea
          ref="areaRef"
          :text="draft.customTemplate"
          spellcheck="false"
          autocomplete="off"
          autocorrect="off"
          placeholder="用 {title} {up} {short_url} 等变量拼文案"
          @change="draft.customTemplate = $event"
        />
        <div v-if="unknownVariables.length" class="share-craft-error">
          未知变量 {{ unknownText }}，复制时会保留原文
        </div>
      </template>
      <template v-else>
        <div class="share-craft-preview">{{ previewText }}</div>
        <div class="share-craft-hint">想自己改文案就把预设换成「自定义」</div>
      </template>

      <details class="share-craft-details">
        <summary>可用变量</summary>
        <div class="share-craft-vars">
          <code v-for="name of variableNames" :key="name">{{ name }}</code>
        </div>
        <div class="share-craft-hint">
          {cover} 是封面链接，{cover_image} 是封面图本身，写上才会附图。
        </div>
      </details>
    </section>

    <section class="share-craft-section">
      <div class="share-craft-section-title">文本格式</div>
      <div class="share-craft-row">
        <span class="share-craft-label">日期</span>
        <VDropdown
          :value="draft.dateFormat"
          :items="dateFormatItems"
          @change="draft.dateFormat = $event"
        >
          <template #item="{ item }">{{ item }}</template>
        </VDropdown>
      </div>
      <div class="share-craft-row">
        <span class="share-craft-label">时长</span>
        <VDropdown
          :value="draft.durationFormat"
          :items="durationFormatItems"
          @change="draft.durationFormat = $event"
        >
          <template #item="{ item }">{{ item }}</template>
        </VDropdown>
      </div>
      <div class="share-craft-row" title="播放 / 点赞 / 投币等数据">
        <span class="share-craft-label">数字</span>
        <VDropdown
          :value="draft.countFormat"
          :items="countFormatItems"
          @change="draft.countFormat = $event"
        >
          <template #item="{ item }">{{ item }}</template>
        </VDropdown>
      </div>
      <div class="share-craft-slider">
        <div class="share-craft-slider-head">
          <span class="share-craft-label">简介长度</span>
          <span class="share-craft-value">{{ descLengthText }}</span>
        </div>
        <VSlider
          :min="0"
          :max="200"
          :step="10"
          :value="draft.descLength"
          :display-fun="value => `${value} 字`"
          @change="draft.descLength = $event"
        />
      </div>
    </section>

    <section class="share-craft-section">
      <div class="share-craft-section-title">封面图</div>
      <div class="share-craft-slider">
        <div class="share-craft-slider-head">
          <span class="share-craft-label">最大宽度</span>
          <span class="share-craft-value">{{ draft.coverWidth }} px</span>
        </div>
        <VSlider
          :min="320"
          :max="1280"
          :step="80"
          :value="draft.coverWidth"
          :display-fun="value => `${value}px`"
          @change="draft.coverWidth = $event"
        />
      </div>
      <div class="share-craft-hint">
        模板里写上 {cover_image} 才会附带封面图，图片就插在它所在的位置。
      </div>
      <details class="share-craft-details">
        <summary>封面图说明</summary>
        <ul class="share-craft-notes">
          <li>封面和文案一起写进剪贴板，QQ / 微信可以整段粘出图文。</li>
          <li>图片由聊天软件从 B 站 CDN 下载，断网时只剩文字。</li>
          <li>只对当前页面的视频附带封面；快捷键 Ctrl+C 仍只复制文字。</li>
          <li>写入失败时会自动回退为纯文本。</li>
        </ul>
      </details>
    </section>

    <section class="share-craft-section">
      <div class="share-craft-section-title">其他</div>
      <div class="share-craft-row share-craft-row--switch">
        <span class="share-craft-label" title="复制成功后弹出提示">复制后提示</span>
        <SwitchBox :checked="draft.showToast" @change="draft.showToast = $event" />
      </div>
      <div class="share-craft-row share-craft-row--switch">
        <span class="share-craft-label" title="进入视频页后预加载视频信息，第一次复制更快">
          预取视频信息
        </span>
        <SwitchBox :checked="draft.prefetchInfo" @change="draft.prefetchInfo = $event" />
      </div>
    </section>

    <div class="share-craft-save">
      <span v-if="dirty" class="share-craft-status share-craft-status--dirty">有未保存的修改</span>
      <span v-else-if="showSaved" class="share-craft-status share-craft-status--saved">已保存</span>
      <VButton type="primary" @click.native="save">保存配置</VButton>
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
  knownVariables,
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
  coverWidth: number
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
  coverWidth: settings.options.coverWidth,
})

const presetItems = Object.values(Preset)
const dateFormatItems = Object.values(DateFormat)
const durationFormatItems = Object.values(DurationFormat)
const countFormatItems = Object.values(CountFormat)
const variableNames = knownVariables.map(name => `{${name}}`)

const isCustom = computed(() => draft.preset === Preset.Custom)
const previewText = computed(() => presetTemplates[draft.preset] ?? '')
const unknownVariables = computed(() =>
  isCustom.value ? findUnknownVariables(draft.customTemplate) : [],
)
const unknownText = computed(() => unknownVariables.value.map(name => `{${name}}`).join('、'))
const descLengthText = computed(() =>
  draft.descLength === 0 ? '不截断' : `${draft.descLength} 字`,
)

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
    draft.prefetchInfo !== o.prefetchInfo ||
    draft.coverWidth !== o.coverWidth
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
  o.coverWidth = draft.coverWidth
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
  gap: 12px;
  margin-top: 8px;
  line-height: 1.5;
}

.share-craft-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.share-craft-section-title {
  font-size: 12px;
  font-weight: 600;
  opacity: 0.6;
}

.share-craft-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 22px;

  .share-craft-label {
    flex: 0 0 64px;
    white-space: nowrap;
  }
  :deep(.be-dropdown) {
    flex: 1 1 auto;
    min-width: 0;
  }
  &--switch {
    .share-craft-label {
      flex: 1 1 auto;
      cursor: default;
    }
  }
}

.share-craft-slider {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 2px 0;

  &-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }
  :deep(.be-slider) {
    margin: 6px 2px 4px;
  }
}

.share-craft-value {
  font-size: 12px;
  opacity: 0.6;
  font-variant-numeric: tabular-nums;
}

.share-craft-settings :deep(.be-text-area) {
  min-height: 140px;
  max-height: 260px;
}

.share-craft-preview {
  padding: 5px 8px;
  border-radius: 4px;
  box-shadow: 0 0 0 1px #8884;
  white-space: pre-wrap;
  word-break: break-all;
  user-select: text;
  max-height: 120px;
  overflow: auto;
}

.share-craft-hint {
  font-size: 12px;
  opacity: 0.6;
  line-height: 1.5;
}

.share-craft-error {
  font-size: 12px;
  color: #f56c6c;
  line-height: 1.5;
}

.share-craft-details {
  font-size: 12px;

  summary {
    cursor: pointer;
    opacity: 0.6;
    width: fit-content;
    outline: none;
    user-select: none;

    &:hover {
      opacity: 0.9;
    }
  }
}

.share-craft-vars {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin: 6px 0;

  code {
    padding: 0 4px;
    border-radius: 3px;
    background-color: #8882;
    font-size: 11px;
    line-height: 18px;
    font-family: inherit;
    user-select: all;
  }
}

.share-craft-notes {
  margin: 6px 0 0;
  padding-left: 16px;
  opacity: 0.6;
  line-height: 1.6;
}

.share-craft-save {
  display: flex;
  align-items: center;
  gap: 8px;
  position: sticky;
  bottom: 0;
  z-index: 2;

  // 抵消 .component-detail-section 的内边距, 让操作栏贴住面板两侧底部
  margin: 2px -12px -8px;
  padding: 8px 12px;
  border-top: 1px solid #8882;
  background-color: #fff;

  body.dark & {
    background-color: var(--be-color-popup-bg, #222);
  }

  :deep(.be-button) {
    margin-left: auto;
  }
}

.share-craft-status {
  font-size: 12px;

  &--dirty {
    color: #e6a23c;
  }
  &--saved {
    color: #2e7d32;
  }
}
</style>
