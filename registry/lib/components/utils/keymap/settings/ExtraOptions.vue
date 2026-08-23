<template>
  <div class="keymap-extra-options">
    <VButton
      ref="keymapButton"
      class="keymap-settings-button"
      @mouseover="preloadKeymapSettings"
      @click="toggleKeymapSettingsPanel"
    >
      <VIcon icon="mdi-keyboard-settings-outline" :size="18" />
      快捷键设置
    </VButton>
    <VButton
      ref="bilibiliPlayerShortcutsButton"
      class="keymap-settings-button"
      @mouseover="preloadBilibiliPlayerShortcutsSettings"
      @click="toggleBilibiliPlayerShortcutsSettingsPanel"
    >
      <VIcon icon="mdi-keyboard-settings-outline" :size="18" />
      B 站原生快捷键设置
    </VButton>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VIcon } from '@/ui'
import { loadKeymapSettings, toggleKeymapSettings } from './vm'
import {
  loadBilibiliPlayerShortcutsSettings,
  toggleBilibiliPlayerShortcutsSettings,
} from './bilibili-player-shortcuts-vm'

type VButtonInstance = InstanceType<typeof VButton>

const keymapButton = ref<VButtonInstance>()
const bilibiliPlayerShortcutsButton = ref<VButtonInstance>()
const getButtonElement = (button?: VButtonInstance) => button?.$el as HTMLElement | undefined

const preloadKeymapSettings = () => loadKeymapSettings(getButtonElement(keymapButton.value))
const toggleKeymapSettingsPanel = () => toggleKeymapSettings(getButtonElement(keymapButton.value))
const preloadBilibiliPlayerShortcutsSettings = () =>
  loadBilibiliPlayerShortcutsSettings(getButtonElement(bilibiliPlayerShortcutsButton.value))
const toggleBilibiliPlayerShortcutsSettingsPanel = () =>
  toggleBilibiliPlayerShortcutsSettings(getButtonElement(bilibiliPlayerShortcutsButton.value))
</script>
<style lang="scss">
@import 'common';
.keymap-extra-options {
  @include v-center();
  justify-content: center;
  gap: 6px;
  padding: 2px;
  .keymap-settings-button {
    .be-icon {
      margin-right: 8px;
    }
  }
}
</style>
