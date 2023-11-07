<template>
  <VButton :disabled="disabled || isWaitingClickEnd" @click="onClick">
    <slot>Button</slot>
  </VButton>
</template>
<script lang="ts">
import type { PropType } from 'vue'
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
    waitOnClick: {
      type: Function as PropType<() => Promise<void>>,
      default: undefined,
    },
  },
  data() {
    return {
      isWaitingClickEnd: false,
    }
  },
  methods: {
    onClick(): void {
      this.isWaitingClickEnd = true
      this.waitOnClick().finally(() => {
        this.isWaitingClickEnd = false
      })
    },
  },
})
</script>
