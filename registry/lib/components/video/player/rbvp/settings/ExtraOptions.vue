<template>
  <div class="rbvp-extra-options">
    <VButton
      ref="button"
      class="rbvp-settings-button"
      @mouseover="loadSettings()"
      @click="toggle()"
    >
      <VIcon icon="mdi-tune" :size="18" />
      RBVP 设置
    </VButton>
  </div>
</template>
<script lang="ts">
import { VButton, VIcon } from '@/ui'
import { loadRbvpSettings, toggleRbvpSettings } from './vm'

export default Vue.extend({
  components: {
    VButton,
    VIcon,
  },
  methods: {
    async loadSettings() {
      await loadRbvpSettings(this.$refs.button)
    },
    async toggle() {
      await toggleRbvpSettings(this.$refs.button)
    },
  },
})
</script>
<style lang="scss">
.rbvp-extra-options {
  display: flex;
  justify-content: center;
  .rbvp-settings-button .be-icon {
    margin-right: 8px;
  }
}
</style>
