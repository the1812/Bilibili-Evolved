<template>
  <div class="be-mini-toast-wrapper">
    <div ref="content" class="be-mini-toast-content">
      <slot />
    </div>
    <div ref="toast" class="be-mini-toast">
      <slot name="toast" />
    </div>
  </div>
</template>
<script lang="ts">
import { createMiniToast } from './mini'

const containerMap: Record<string, HTMLElement | (() => HTMLElement)> = {
  body: () => document.body,
  local: undefined,
}
export default Vue.extend({
  model: {
    prop: 'show',
    event: 'change',
  },
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
    this.toast = createMiniToast(this.$refs.toast, this.$refs.content, {
      placement: this.placement,
      showOnCreate: this.show,
      trigger: 'mouseenter focusin',
      onHide: () => {
        this.$emit('change', false)
      },
      onShow: () => {
        this.$emit('change', true)
      },
      appendTo: typeof appendTarget === 'function' ? appendTarget() : appendTarget,
      // ...(lodash.omit(this.$props, 'show', 'container')),
      ...this.$attrs,
    })
  },
})
</script>
