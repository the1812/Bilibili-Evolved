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
import {
  VButton,
  VIcon,
} from '@/ui'

let settingsVM: Vue & {
  popupOpen: boolean
}
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
      if (settingsVM) {
        return
      }
      const triggerButton = this.$refs.button.$el as HTMLElement
      const KeymapSettings = await import('./KeymapSettings.vue').then(m => m.default)
      settingsVM = new KeymapSettings({
        propsData: {
          triggerElement: triggerButton,
        },
      }).$mount()
      console.log(triggerButton, settingsVM, settingsVM.$el)
      document.body.insertAdjacentElement('beforeend', settingsVM.$el)
    },
    toggleSettings() {
      if (!settingsVM) {
        return
      }
      settingsVM.popupOpen = !settingsVM.popupOpen
    },
  },
})
</script>
<style lang="scss">
@import "common";
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
