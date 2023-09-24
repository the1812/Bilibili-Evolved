<template>
  <VPopup
    ref="popup"
    v-model="popupOpen"
    class="custom-font-family-extra-options-panel extra-options-panel"
    fixed
    :lazy="false"
    :trigger-element="triggerElement"
    :class="{ peek: isPeeking }"
  >
    <div class="eop-header">
      <div class="eop-h-left">
        <VIcon class="eop-h-l-symbol" icon="mdi-format-font" :size="24"></VIcon>
        <div class="eop-h-l-title">字体设置</div>
      </div>

      <div class="eop-h-right">
        <VIcon
          class="eop-h-r-reset"
          title="重置面板中的所有选项为默认值"
          icon="mdi-cog-sync-outline"
          :size="24"
          @click="confirmResetOptions()"
        ></VIcon>
        <VIcon
          class="eop-h-r-peek"
          title="透视"
          icon="mdi-eye-outline"
          :size="24"
          @mouseover="mouseOnPeekIcon = true"
          @mouseout="mouseOnPeekIcon = false"
        ></VIcon>
        <VIcon
          class="eop-h-r-close"
          title="关闭"
          icon="mdi-close"
          :size="24"
          @click="popupOpen = false"
        ></VIcon>
      </div>
    </div>

    <div class="eop-separator"></div>

    <div class="eop-content">
      <div class="eop-c-section">
        <div class="eop-c-s-title">自定义字体</div>
        <div class="eop-c-s-description">输入字体，不同字体之间必须以英文逗号分隔</div>
        <div class="eop-c-s-input input-font-family">
          <TextArea v-model="inputFontFamily" />
        </div>
      </div>
    </div>
  </VPopup>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { VPopup, VIcon, TextArea } from '@/ui'
import { getComponentSettings } from '@/core/settings'
import { delay } from '@/core/utils'
import { useScopedConsole } from '@/core/utils/log'
import { fontFamilyDefaultValue } from '../font-family-default-value'

export default defineComponent({
  components: {
    VPopup,
    VIcon,
    TextArea,
  },

  props: {
    triggerElement: {
      type: HTMLElement,
      default: null,
    },
  },

  data() {
    return {
      popupOpen: false,
      isPeeking: false,
      mouseOnPeekIcon: false,
      // 设置 inputFontFamily 初始值为组件 fontFamily 选项的值
      inputFontFamily: getComponentSettings('customFontFamily').options.fontFamily,
    }
  },

  watch: {
    // 监听 inputFontFamily 修改动作，实时修改组件 fontFamily 选项为 inputFontFamily 修改后的新值，并拥有 500ms 防抖
    inputFontFamily: lodash.debounce(value => {
      getComponentSettings('customFontFamily').options.fontFamily = value
    }, 500),

    async mouseOnPeekIcon(value: boolean) {
      if (!value) {
        this.isPeeking = false
        return
      }
      if (value) {
        await delay(200)
      }
      if (this.mouseOnPeekIcon) {
        this.isPeeking = true
      }
    },
  },

  methods: {
    confirmResetOptions() {
      if (confirm('确定将面板中的所有选项重置为默认值吗？')) {
        this.resetOptions()
      }
    },

    resetOptions() {
      getComponentSettings('customFontFamily').options.fontFamily = fontFamilyDefaultValue
      this.inputFontFamily = fontFamilyDefaultValue
      const console = useScopedConsole('自定义字体')
      console.log('已将字体设置面板中的所有选项重置为默认值')
    },
  },
})
</script>

<style lang="scss">
@import './extra-options-panel';

.custom-font-family-extra-options-panel {
  @include extra-options-panel;

  > .eop-content > .eop-c-section > .eop-c-s-input.input-font-family .be-text-area {
    min-height: 160px;
  }
}
</style>
