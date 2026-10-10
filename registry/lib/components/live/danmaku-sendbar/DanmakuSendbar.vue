<template>
  <div ref="element" class="danmaku-send-bar" :class="{ enabled }">
    <input
      type="text"
      placeholder="发个弹幕呗~"
      :value="value"
      :disabled="!controls"
      maxlength="30"
      autocomplete="off"
      @keydown.enter="send()"
      @input="updateValue($event.target.value)"
      @focus="setControlBarLocked(true)"
      @blur="setControlBarLocked(false)"
    />
  </div>
</template>
<script setup lang="ts">
import { ref, shallowRef, watch, onMounted } from 'vue'
import { select } from '@/core/spin-query'
import { raiseEvent } from '@/core/utils'
import { setControlBarLocked, waitForControlBar } from '@/components/live/live-control-bar'
import {
  originalTextAreaSelector,
  sendButtonSelector,
  leftControllerSelector,
} from './original-elements'

const element = ref<HTMLElement>()
const value = ref('')
const enabled = ref(false)
const controls = shallowRef<{ textArea: HTMLTextAreaElement; button: HTMLButtonElement }>()

watch(
  enabled,
  active => {
    if (!active) {
      element.value.querySelector('input').blur()
      setControlBarLocked(false)
    }
  },
  { flush: 'sync' },
)
const updateValue = (text: string) => {
  controls.value.textArea.value = text
}
const send = () => {
  if (!controls.value.button.disabled) {
    value.value = ''
    controls.value.button.click()
  }
}
onMounted(async () => {
  waitForControlBar({
    callback: controlBar => {
      const leftController = dq(controlBar, leftControllerSelector)
      if (!leftController) {
        throw new Error('[danmakuSendBar] leftController not found')
      }
      setControlBarLocked(false)
      leftController.insertAdjacentElement('afterend', element.value)
    },
  })
  const [textArea, button] = await Promise.all([
    select<HTMLTextAreaElement>(originalTextAreaSelector),
    select<HTMLButtonElement>(sendButtonSelector),
  ])
  if (!textArea || !button) {
    throw new Error(
      `[danmakuSendBar] ref elements not found. originalTextArea = ${
        textArea === null
      } sendButton = ${button === null}`,
    )
  }
  controls.value = { textArea, button }
  value.value = textArea.value
  const listenChange = () => {
    value.value = textArea.value
  }
  textArea.addEventListener('input', listenChange)
  textArea.addEventListener('change', listenChange)
  const descriptor =
    Object.getOwnPropertyDescriptor(textArea, 'value') ??
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')
  Object.defineProperty(textArea, 'value', {
    ...descriptor,
    set(text: string) {
      descriptor.set.call(this, text)
      raiseEvent(textArea, 'input')
    },
  })
})

defineExpose({ enabled })
</script>
<style lang="scss">
.live-web-player-controller {
  .danmaku-send-bar {
    display: none;
  }
}
.live-web-player-controller {
  background-image: linear-gradient(to bottom, transparent 20%, rgba(0, 0, 0, 0.9));
}
@media screen and (min-width: 1038px) {
  .player-full-win {
    .live-web-player-controller .control-area {
      .danmaku-send-bar {
        &.enabled {
          display: flex;
        }
        margin: 0 24px;
        flex: 1 1 0;
        height: 24px;
        justify-content: center;
        align-items: center;
        input {
          outline: none !important;
          border: none;
          border-bottom: 2px solid #fff8;
          background-color: transparent;
          color: #fff;
          cursor: text;
          padding: 4px;
          line-height: normal;
          flex: 1;
          width: 0;
          max-width: 400px;
          min-width: 70px;
          &:focus-within {
            border-color: var(--theme-color);
          }
          &::-webkit-input-placeholder {
            color: #fff8 !important;
          }
        }
      }
      .right-area {
        flex: 0 0 auto !important;
      }
    }
  }
}
</style>
