<template>
  <div class="be-mini-toast-wrapper">
    <div ref="content" class="be-mini-toast-content">
      <slot />
    </div>
    <div ref="toastRef" class="be-mini-toast">
      <slot name="toast" />
    </div>
  </div>
</template>
<script lang="ts">
import type { Ref } from 'vue'
import { defineComponent, ref } from 'vue'
import { createMiniToast } from './mini'

const containerMap: Record<string, HTMLElement | (() => HTMLElement)> = {
  body: () => document.body,
  local: undefined,
}
export default defineComponent({
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    container: {
      type: String,
      default: 'local',
    },
    placement: {
      type: String,
      default: undefined,
    },
  },
  emits: ['update:show'],
  setup: () => ({
    content: ref(null) as Ref<HTMLDivElement | null>,
    toastRef: ref(null) as Ref<HTMLDivElement | null>,
  }),
  data() {
    return {
      toast: null,
    }
  },
  watch: {
    placement(newValue: string) {
      if (newValue && this.toast) {
        this.toast.placement = newValue
      }
    },
  },
  async mounted() {
    await this.$nextTick()
    const appendTarget = containerMap[this.container]
    this.toast = createMiniToast(this.message, this.content, {
      content: this.toastRef,
      placement: this.placement,
      showOnCreate: this.show,
      trigger: 'mouseenter focusin',
      onHide: () => {
        this.$emit('update:show', false)
      },
      onShow: () => {
        this.$emit('update:show', true)
      },
      appendTo: typeof appendTarget === 'function' ? appendTarget() : appendTarget,
      // ...(lodash.omit(this.$props, 'show', 'container')),
      ...this.$attrs,
    })
  },
})
</script>
