<template>
  <div class="custom-font-family-extra-options-entry">
    <VButton @mouseover="loadPanel()" @click="togglePanelDisplay()">
      更多选项<VIcon icon="right-arrow" :size="16"></VIcon>
    </VButton>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { VIcon, VButton } from '@/ui'
import { loadPanel, togglePanelDisplay } from './vm'

export default defineComponent({
  components: {
    VIcon,
    VButton,
  },

  methods: {
    loadPanel,
    togglePanelDisplay,
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
