<template>
  <VPopup v-model="popupOpen" class="extra-options-panel" fixed :lazy="false">
    <div class="eop-header">
      <div class="eop-h-left">
        <VIcon class="eop-h-l-symbol" :icon="initData.header.title.icon" :size="24"></VIcon>
        <div class="eop-h-l-title">{{ initData.header.title.text }}</div>
      </div>

      <div class="eop-h-right">
        <VIcon
          v-for="action in initData.header.actions"
          :key="action.id"
          :ref="`action${action.id}`"
          :class="`eop-h-r-${action.iconClassNameSuffix}`"
          :title="action.title"
          :icon="action.icon"
          :size="24"
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
      <div v-for="option in initData.content.options" :key="option.id" class="eop-c-option">
        <div class="eop-c-o-title">{{ option.title }}</div>
        <div class="eop-c-o-description">{{ option.description }}</div>
        <div class="eop-c-o-input" :class="option.inputClassName">
          <slot :name="`eop-c-o-input-slot-${option.id}`">
            选项输入入口默认文字，使用含 v-slot 指令的 template 元素以替换默认内容
          </slot>
        </div>
      </div>
    </div>
  </VPopup>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { VPopup, VIcon } from '@/ui'
import { defaultInitData } from './extra-options-panel'

export default defineComponent({
  name: 'ExtraOptionsPanel',

  components: {
    VPopup,
    VIcon,
  },

  props: {
    initData: {
      type: Object,
      default: defaultInitData,
    },
  },

  data() {
    return {
      popupOpen: false,
    }
  },
})
</script>

<style lang="scss">
@import './extra-options-panel';

.extra-options-panel {
  @include extra-options-panel;
}
</style>
