<template>
  <VPopup
    ref="popup"
    v-model="popupOpen"
    class="extra-options-panel"
    fixed
    :lazy="false"
    :trigger-element="triggerElement"
  >
    <div class="eop-header">
      <div class="eop-h-left">
        <VIcon class="eop-h-l-symbol" :icon="initData.header.title.icon" :size="24"></VIcon>
        <div class="eop-h-l-title">{{ initData.header.title.text }}</div>
      </div>

      <div class="eop-h-right">
        <VIcon
          v-for="action in initData.header.actions"
          :key="action.id"
          :class="`eop-h-r-${action.classNameSuffix}`"
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
      <div v-for="section in initData.content.sections" :key="section.id" class="eop-c-section">
        <div class="eop-c-s-title">{{ section.title }}</div>
        <div class="eop-c-s-description">{{ section.description }}</div>
        <div class="eop-c-s-input" :class="section.inputClassName">
          <slot :name="`eop-c-s-input-slot-${section.id}`">
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
import { ExtraOptionsPanelInitData } from './extra-options-panel'

const defaultInitData: ExtraOptionsPanelInitData = {
  header: {
    title: {
      text: '默认标题',
      icon: 'mdi-format-font',
    },
    actions: [
      {
        id: 0,
        title: '默认动作 0',
        icon: 'mdi-cog-sync-outline',
        classNameSuffix: 'default-action-0',
      },
      {
        id: 1,
        title: '默认动作 1',
        icon: 'mdi-eye-outline',
        classNameSuffix: 'default-action-1',
      },
    ],
  },
  content: {
    sections: [
      {
        id: 0,
        title: '默认选项 0',
        description: '默认选项 0 的说明',
        inputClassName: 'default-option-0',
      },
      {
        id: 1,
        title: '默认选项 1',
        description: '默认选项 1 的说明',
        inputClassName: 'default-option-1',
      },
    ],
  },
}

export default defineComponent({
  name: 'ExtraOptionsPanel',

  components: {
    VPopup,
    VIcon,
  },

  props: {
    triggerElement: {
      type: HTMLElement,
      default: null,
    },
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
