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
import VButton from './VButton.vue'

export default Vue.extend({
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
    listeners() {
      return lodash.omit(this.$listeners, 'click')
    },
    onClick() {
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
