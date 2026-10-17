<template>
  <VPopup
    v-model="popupOpen"
    fixed
    class="bilibili-player-shortcuts-settings-popup be-settings-extra-options"
    :trigger-element="triggerElement"
  >
    <div class="bilibili-player-shortcuts-settings">
      <div class="bilibili-player-shortcuts-settings-header">
        <div class="bilibili-player-shortcuts-settings-title">
          <VIcon icon="mdi-keyboard-settings-outline" />
          B 站原生快捷键设置
        </div>
        <div class="bilibili-player-shortcuts-settings-close" title="关闭">
          <VIcon :size="18" icon="close" @click="popupOpen = false" />
        </div>
      </div>
      <div class="bilibili-player-shortcuts-settings-content">
        <div class="bilibili-player-shortcuts-settings-grid">
          <div class="grid-header">
            <div>动作</div>
            <div>默认按键</div>
            <div class="blocked-column">是否屏蔽</div>
          </div>
          <div
            v-for="shortcut of shortcuts"
            :key="shortcut.id"
            class="grid-row"
            :class="{ blocked: isBlocked(shortcut.id) }"
          >
            <div>{{ shortcut.displayName }}</div>
            <div class="key-display-name">{{ shortcut.keyDisplayName }}</div>
            <div class="blocked-column">
              <CheckBox
                :checked="isBlocked(shortcut.id)"
                :title="`${isBlocked(shortcut.id) ? '取消屏蔽' : '屏蔽'}${shortcut.keyDisplayName}`"
                checked-icon="mdi-checkbox-marked"
                not-checked-icon="mdi-checkbox-blank-outline"
                @change="setBlocked(shortcut.id, $event)"
              >
                <span class="checkbox-label">屏蔽</span>
              </CheckBox>
            </div>
          </div>
        </div>
      </div>
    </div>
  </VPopup>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { getComponentSettings } from '@/core/settings'
import { CheckBox, VIcon, VPopup } from '@/ui'
import { bilibiliPlayerShortcuts } from '../bilibili-player-shortcuts'
import type { Options } from '../index'

const keymapOptions = getComponentSettings<Options>('keymap').options
const popupOpen = ref(false)
const triggerElement = ref<HTMLElement | null>(null)
const shortcuts = bilibiliPlayerShortcuts

const blockedShortcuts = computed<string[]>({
  get: () => keymapOptions.blockedBilibiliPlayerShortcuts,
  set: value => {
    keymapOptions.blockedBilibiliPlayerShortcuts = value
  },
})

const isBlocked = (id: string) => blockedShortcuts.value.includes(id)
const setBlocked = (id: string, blocked: boolean) => {
  const nextBlockedShortcuts = new Set(blockedShortcuts.value)
  if (blocked) {
    nextBlockedShortcuts.add(id)
  } else {
    nextBlockedShortcuts.delete(id)
  }
  blockedShortcuts.value = [...nextBlockedShortcuts]
}

defineExpose({
  popupOpen,
  triggerElement,
})
</script>

<style lang="scss">
@import 'common';

.bilibili-player-shortcuts-settings-popup {
  @include popup();
  transition: 0.2s ease-out;
  width: 500px;
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

.bilibili-player-shortcuts-settings {
  font-size: 12px;
  display: flex;
  flex-direction: column;
  padding: 12px 12px 0 18px;

  &-header {
    @include h-center();
    margin-bottom: 8px;
  }

  &-title {
    flex: 1 0 auto;
    @include h-center();
    @include semi-bold();
    font-size: 18px;

    .be-icon {
      margin-right: 6px;
    }
  }

  &-close {
    display: flex;
    padding: 6px;
    cursor: pointer;
    transition: 0.2s ease-out;

    &:hover {
      color: var(--theme-color);
    }
  }

  &-content {
    max-height: calc(100vh - 200px);
    overflow: auto;
    padding-bottom: 12px;
  }

  &-grid {
    .grid-header,
    .grid-row {
      display: grid;
      grid-template-columns: minmax(0, 2fr) minmax(100px, 1fr) 72px;
      gap: 8px;
      align-items: center;
      min-height: 32px;

      > * {
        min-width: 0;
      }
    }

    .grid-header {
      padding: 0 0 4px;
      border-bottom: 1px solid #8882;
      position: sticky;
      top: 0;
      z-index: 1;
      background-color: #fff;

      body.dark & {
        background-color: #222;
      }
    }

    .grid-row {
      border-bottom: 1px solid #8881;

      > :not(.blocked-column) {
        transition: opacity 0.2s ease-out;
      }

      &.blocked > :not(.blocked-column) {
        opacity: 0.25;
      }
    }

    .key-display-name {
      font-family: monospace;
    }

    .blocked-column {
      display: flex;
      justify-content: center;

      .be-check-box {
        min-width: 28px;
        padding: 4px;

        .text-container {
          display: none;
        }

        .icon-container {
          margin: 0;
        }
      }
    }

    .checkbox-label {
      display: none;
    }
  }
}

@media (max-width: 540px) {
  .bilibili-player-shortcuts-settings-popup {
    width: calc(100vw - 24px);
  }
}
</style>
