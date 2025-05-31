<template>
  <VPopup v-model="popupOpen" class="be-extra-options-panel" fixed :lazy="false">
    <div class="be-eop-header">
      <div class="be-eop-h-title">
        <VIcon class="be-eop-h-t-icon" :icon="initData.header.title.icon" :size="24"></VIcon>
        <div class="be-eop-h-t-text">{{ initData.header.title.text }}</div>
      </div>

      <div class="be-eop-h-actions">
        <div v-for="action in initData.header.actions" :key="action.id" class="be-eop-h-a-action">
          <VIcon
            :ref="`action${action.id}`"
            :class="`action-${action.actionClassNameSuffix}`"
            :title="action.title"
            :icon="action.icon"
            :size="24"
          ></VIcon>
        </div>
        <div class="be-eop-h-a-action">
          <VIcon
            class="action-close"
            title="关闭"
            icon="mdi-close"
            :size="24"
            @click="popupOpen = false"
          ></VIcon>
        </div>
      </div>
    </div>

    <div class="be-eop-separator"></div>

    <div class="be-eop-content">
      <div v-for="option in initData.content.options" :key="option.id" class="be-eop-c-option">
        <div class="be-eop-c-o-title">{{ option.title }}</div>
        <div class="be-eop-c-o-description">{{ option.description }}</div>
        <div class="be-eop-c-o-input" :class="`input-${option.inputClassNameSuffix}`">
          <slot :name="`input${option.id}`">
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

.be-extra-options-panel {
  @include extra-options-panel();
}
</style>
