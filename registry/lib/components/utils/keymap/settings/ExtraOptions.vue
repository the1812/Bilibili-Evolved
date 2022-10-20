<template>
  <div class="keymap-extra-options">
    <VButton
      ref="button"
      class="keymap-settings-button"
      @mouseover="loadSettings()"
      @click="toggleSettings()"
    >
      <VIcon icon="mdi-keyboard-settings-outline" :size="18" />
      快捷键设置
    </VButton>
  </div>
</template>
<script lang="ts">
import { VButton, VIcon } from '@/ui'
import { loadKeymapSettings, toggleKeymapSettings } from './vm'

export default Vue.extend({
  components: {
    VButton,
    VIcon,
  },
  data() {
    return {
      popupOpen: false,
    }
  },
  methods: {
    async loadSettings() {
      await loadKeymapSettings(this.$refs.button)
    },
    async toggleSettings() {
      await toggleKeymapSettings(this.$refs.button)
    },
  },
})
</script>
<style lang="scss">
@import 'common';
.keymap-extra-options {
  @include h-center();
  justify-content: center;
  .keymap-settings-button {
    .be-icon {
      margin-right: 8px;
    }
  }
}
</style>
