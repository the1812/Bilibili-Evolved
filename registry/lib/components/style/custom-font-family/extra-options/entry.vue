<template>
  <div class="custom-font-family-extra-options-entry">
    <VButton ref="button" @mouseover="loadExtraOptions()" @click="toggleExtraOptionsDisplay()">
      字体设置<VIcon icon="right-arrow" :size="16"></VIcon>
    </VButton>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { VIcon, VButton } from '@/ui'
import {
  setTriggerElement,
  getExtraOptionsLoadState,
  loadExtraOptions,
  toggleExtraOptionsDisplay,
} from './vm'

export default defineComponent({
  components: {
    VIcon,
    VButton,
  },

  methods: {
    async loadExtraOptions() {
      const isLoaded = await getExtraOptionsLoadState()
      if (!isLoaded) {
        await loadExtraOptions()
        const triggerButton = this.$refs.button.$el as HTMLElement
        setTriggerElement(triggerButton)
      }
    },
    toggleExtraOptionsDisplay,
  },
})
</script>

<style lang="scss">
.custom-font-family-extra-options-entry {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
