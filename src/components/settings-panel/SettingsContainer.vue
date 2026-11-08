<template>
  <div class="be-settings">
    <div class="sidebar">
      <div
        ref="widgetsIcon"
        title="功能"
        :class="{ open: widgetsOpened }"
        @click.shift="theWorld"
        @click.exact="widgetsOpened = !widgetsOpened"
        @mouseover="loadPanel(widgetsPanelPopup)"
      >
        <VIcon icon="widgets" :size="26"></VIcon>
      </div>
      <div
        ref="settingsIcon"
        title="设置"
        :class="{ open: settingsOpened }"
        @click="settingsOpened = !settingsOpened"
        @mouseover="loadPanel(settingsPanelPopup)"
      >
        <VIcon icon="settings-outline" :size="26"></VIcon>
      </div>
    </div>
    <VPopup
      ref="widgetsPanelPopup"
      v-model="widgetsOpened"
      class="widgets-panel-popup"
      :trigger-element="widgetsIcon"
      :fixed="true"
    >
      <WidgetsPanel />
    </VPopup>
    <VPopup
      ref="settingsPanelPopup"
      v-model="settingsOpened"
      class="settings-panel-popup"
      :trigger-element="settingsIcon"
      :auto-close-predicate="settingsPanelClosePredicate"
      :fixed="true"
    >
      <SettingsPanel :open="settingsOpened" @close="settingsOpened = false" />
    </VPopup>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import { VPopup, VIcon } from '@/ui'
import { externalApis } from '@/core/core-apis'

const SettingsPanel = defineAsyncComponent(() => import('./SettingsPanel.vue'))
const WidgetsPanel = defineAsyncComponent(() => import('./WidgetsPanel.vue'))

const settingsOpened = ref(false)
const widgetsOpened = ref(false)
const settingsIcon = ref<HTMLElement>()
const widgetsIcon = ref<HTMLElement>()
const settingsPanelPopup = ref<InstanceType<typeof VPopup>>()
const widgetsPanelPopup = ref<InstanceType<typeof VPopup>>()

const theWorld = () => externalApis.theWorld(0)
const handleWindowBlur = () => {
  setTimeout(() => {
    if (document.activeElement instanceof HTMLIFrameElement) {
      settingsOpened.value = false
      widgetsOpened.value = false
    }
  }, 0)
}
const settingsPanelClosePredicate = ({ target }: { target: HTMLElement }) =>
  !dqa('.be-settings-extra-options').some(element => element.contains(target))
const loadPanel = (popup?: InstanceType<typeof VPopup>) => {
  if (popup) {
    popup.loaded = true
  }
}

onMounted(() => {
  GM_registerMenuCommand('功能', () => {
    loadPanel(widgetsPanelPopup.value)
    widgetsOpened.value = true
    settingsOpened.value = false
  })
  GM_registerMenuCommand('设置', () => {
    loadPanel(settingsPanelPopup.value)
    widgetsOpened.value = false
    settingsOpened.value = true
  })
  window.addEventListener('blur', handleWindowBlur)
})
onBeforeUnmount(() => window.removeEventListener('blur', handleWindowBlur))
</script>

<style lang="scss">
@import 'common';
.be-settings {
  body.player-mode-blackmask & {
    visibility: hidden;
  }
  line-height: normal;
  font-size: 12px;
  --panel-height: calc(100vh - 120px);
  // &,
  // & *,
  // & *::before,
  // & *::after {
  //   transition: 0.3s ease-in-out;
  // }
  & > .sidebar {
    position: fixed;
    top: 50%;
    z-index: 1002;
    transform: translateX(calc(-50% * var(--direction))) translateY(-50%);

    @include on-fullscreen {
      z-index: 1;
    }
    & > * {
      transition: transform 0.3s ease-out, opacity 0.3s ease-out;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      $size: 26px;
      width: $size;
      height: $size;
      padding: 8px;
      box-sizing: content-box;
      background-color: #fffa;
      border-radius: 50%;
      position: relative;
      body.dark & {
        background-color: #333a;
      }
      &:not(:last-child) {
        margin-bottom: $size;
      }
      &::after {
        content: '';
        width: 140%;
        height: 140%;
        position: absolute;
        top: -20%;
        left: -20%;
        background: transparent;
      }
      .be-icon {
        font-size: $size;
        color: #888;
        fill: #888;
        transition: fill 0.3s ease-out;
      }
      &:hover {
        transform: translateX(calc(60% * var(--direction))) scale(1.1);
        background-color: #fff;
        body.dark & {
          background-color: var(--be-color-button-bg, #333);
        }
        .be-icon {
          color: #222;
          fill: #222;
          body.dark & {
            color: var(--be-color-text-title, #eee);
            fill: var(--be-color-text-title, #eee);
          }
        }
      }
      &.open {
        transform: translateX(calc(100% * var(--direction))) scale(1.5);
        opacity: 0;
      }
    }
  }
  .settings-panel-popup {
    transition: transform 0.3s cubic-bezier(0.22, 0.61, 0.36, 1),
      opacity 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
    top: 50%;
    z-index: 100001;
    &.close {
      transform: translateZ(0) translateY(-50%) translateX(calc(-48% * var(--direction)));
    }
    &.open {
      transform: translateZ(0) translateY(-50%) translateX(0);
    }
  }
  .widgets-panel-popup {
    top: 50%;
    z-index: 100001;
    transition: transform 0.3s cubic-bezier(0.22, 0.61, 0.36, 1),
      opacity 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
    &.close {
      transform: translateZ(0) translateY(-50%) translateX(calc(-48% * var(--direction)));
    }
    &.open {
      transform: translateZ(0) translateY(-50%) translateX(0);
    }
  }
}
.bilibili-player-dm-tip-wrap {
  pointer-events: none !important;
}
@import './dock/center';
@import './dock/left';
@import './dock/right';
</style>
