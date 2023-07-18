<template>
  <VPopup
    v-model="popupOpen"
    fixed
    class="keymap-settings-popup be-settings-extra-options"
    :trigger-element="triggerElement"
  >
    <div class="keymap-settings">
      <div class="keymap-settings-header">
        <div class="keymap-settings-header-title">
          <VIcon icon="mdi-keyboard-settings-outline" />
          快捷键设置
        </div>
        <a
          class="keymap-settings-header-help"
          href="https://github.com/the1812/Bilibili-Evolved/blob/preview/registry/lib/components/utils/keymap/help.md"
          target="_blank"
          title="查看帮助"
        >
          <VIcon :size="18" icon="mdi-help-circle-outline" />
        </a>
        <div class="keymap-settings-header-close" title="关闭">
          <VIcon :size="18" icon="close" @click="popupOpen = false" />
        </div>
      </div>
      <div class="keymap-settings-content">
        <div class="keymap-settings-grid">
          <div class="grid-header">
            <div class="header-name">动作</div>
            <div class="header-default-binding">默认按键</div>
            <div class="header-preset-binding">
              <VDropdown v-model="selectedPreset" :items="presetOptions" :key-mapper="it => it">
                <template #item="{ item }">
                  {{ item }}
                </template>
              </VDropdown>
            </div>
            <div class="header-custom-binding">自定义按键</div>
          </div>
          <KeymapSettingsRow
            v-for="row of rows"
            :key="row.name"
            :row="row"
            :selected-preset="selectedPreset"
          />
        </div>
      </div>
    </div>
  </VPopup>
</template>
<script lang="ts">
import { getComponentSettings } from '@/core/settings'
import { VIcon, VDropdown, VPopup } from '@/ui'
import KeymapSettingsRow from './KeymapSettingsRow.vue'
import { actions } from '../actions'
import { KeyBindingAction } from '../bindings'
import { presets } from '../presets'

const keymapOptions = getComponentSettings('keymap').options
console.log(presets, actions, keymapOptions.preset, keymapOptions.customKeyBindings)
export default Vue.extend({
  components: {
    VIcon,
    VDropdown,
    VPopup,
    KeymapSettingsRow,
  },
  props: {
    triggerElement: {
      type: HTMLElement,
      default: null,
    },
  },
  data() {
    return {
      popupOpen: false,
      actions,
      presets,
      customKeyBindings: keymapOptions.customKeyBindings,
    }
  },
  computed: {
    selectedPreset: {
      get() {
        return keymapOptions.preset
      },
      set(value: string) {
        keymapOptions.preset = value
      },
    },
    rows() {
      return Object.entries(this.actions).map(([name, action]) => ({
        name,
        ...(action as KeyBindingAction),
      }))
    },
    presetOptions() {
      return Object.keys(this.presets)
    },
  },
})
</script>
<style lang="scss">
@import 'common';

.keymap-settings-popup {
  @include popup();
  transition: 0.2s ease-out;
  width: 550px;
  top: 50%;
  left: 50%;
  z-index: 100002;
  transform: translateX(-50%) translateY(-50%) scale(0.9);
  display: flex;
  flex-direction: column;

  &.open {
    transform: translateX(-50%) translateY(-50%) scale(1);
  }
}
.keymap-settings {
  font-size: 12px;
  display: flex;
  flex-direction: column;
  padding: 12px 12px 0 18px;
  &-header {
    @include h-center();
    margin-bottom: 8px;
    &-title {
      flex: 1 0 auto;
      @include h-center();
      @include semi-bold();
      font-size: 18px;
      .be-icon {
        margin-right: 6px;
      }
    }
    &-help,
    &-close {
      display: flex;
      padding: 6px;
      cursor: pointer;
      transition: 0.2s ease-out;
      color: inherit;
      &:hover {
        color: var(--theme-color);
      }
    }
  }
  &-content {
    flex: 1 0 auto;
    max-height: calc(100vh - 200px);
    overflow: auto;
    padding-bottom: 12px;
    .keymap-settings-grid {
      .grid-header,
      .grid-row {
        @include h-center();
        gap: 8px;
        justify-content: space-between;
        height: 24px;
        box-sizing: content-box;

        > * {
          flex: 1 0 0;
          @include h-center();
        }
      }
      .grid-header {
        margin-bottom: 4px;
        padding: 4px 0 6px 0;
        border-bottom: 1px solid #8882;
        position: sticky;
        top: 0;
        z-index: 1;
        background-color: #fff;
        body.dark & {
          background-color: #222;
        }
      }
    }
  }
}
</style>
