<template>
  <div>
    <VPopup v-if="isPopup" v-model="popup" :trigger-element="$refs.popupButton" auto-destroy>
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
