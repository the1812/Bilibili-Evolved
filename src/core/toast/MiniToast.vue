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

const containerMap: Record<string, HTMLElement> = {
  body: document.body,
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
  },
  data() {
    return {
      toast: null,
    }
  },
  async mounted() {
    await this.$nextTick()
    this.toast = createMiniToast(this.message, this.$refs.content, {
      content: this.$refs.toast,
      showOnCreate: this.show,
      trigger: 'manual',
      onHide: () => {
        this.$emit('change', false)
      },
      onShow: () => {
        this.$emit('change', true)
      },
      appendTo: containerMap[this.container],
      ...(lodash.omit(this.$props, 'show')),
      ...this.$attrs,
    })
  },
})
</script>
