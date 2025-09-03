<template>
  <div class="option-widget-layout">
    <VPopup
      v-if="isPopup"
      v-model="popup"
      :trigger-element="$refs.popupButton"
      auto-destroy
      class="option-widget-popup"
    >
      <slot />
    </VPopup>
    <DefaultWidget v-if="isPopup" ref="popupButton" :icon="icon" @click="popup = !popup">
      <span>{{ title }}</span>
    </DefaultWidget>

    <slot v-if="!isPopup" />
  </div>
</template>

<script lang="ts">
import { DefaultWidget, VPopup } from '@/ui'

export default Vue.extend({
  components: {
    DefaultWidget,
    VPopup,
  },
  props: {
    /** 是否弹出显示，false：直接显示内容，true：显示一个按钮，点击弹出显示内容 */
    isPopup: {
      type: Boolean,
      required: true,
    },
    /** 按钮标题 */
    title: {
      type: String,
      required: true,
    },
    /** 按钮Icon */
    icon: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      popup: false,
    }
  },
})
</script>

<style lang="scss">
@import 'common';

.option-widget-layout {
  position: relative;
}

.option-widget-popup {
  font-size: 12px;
  transition: 0.2s ease-out;
  transform-origin: left;
  transform: translateY(-50%) scale(0.9);
  top: 50%;
  left: calc(100% + 8px);
  @include default-background-color();
  @include shadow();
  white-space: nowrap;
  display: grid;
  width: max-content;
  min-width: 180px;
  grid-template-columns: repeat(var(--columns), auto);
  border-radius: 4px;
  border: none;
  max-height: calc(100vh - 100px);
  @include no-scrollbar();

  &.open {
    transform: translateY(-50%) scale(1);
  }
  body.settings-panel-dock-right & {
    right: calc(100% + 8px);
    left: unset;
    transform-origin: right;
  }
}
</style>
