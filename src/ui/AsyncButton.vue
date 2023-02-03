<template>
  <VButton
    v-bind="$attrs"
    :disabled="disabled || internalDisabled"
    v-on="listeners"
    @click="onClick"
  >
    <slot>Button</slot>
  </VButton>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import VButton from './VButton.vue'

export default defineComponent({
  components: {
    VButton,
  },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      internalDisabled: false,
    }
  },
  computed: {
    // eslint-disable-next-line @typescript-eslint/ban-types
    listeners(): Record<string, Function | Function[]> {
      return lodash.omit(this.$listeners, 'click')
    },
    onClick(): (...args: unknown[]) => Promise<void> {
      return async (...args: unknown[]) => {
        try {
          this.internalDisabled = true
          await this.$listeners.click?.(...args)
        } finally {
          this.internalDisabled = false
        }
      }
    },
  },
})
</script>
