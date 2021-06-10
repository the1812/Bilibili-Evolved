<template>
  <div class="danmaku-send-bar">
    <input
      type="text"
      placeholder="发个弹幕呗~"
      :value="value"
      maxlength="30"
      @keydown.enter="send()"
      @input="updateValue($event.target.value)"
    />
  </div>
</template>
<script lang="ts">
import { dq, raiseEvent } from '@/core/utils'
import { originalTextAreaSelector, sendButtonSelector } from './original-elements'

const originalTextArea = dq(originalTextAreaSelector) as HTMLTextAreaElement
const sendButton = dq(sendButtonSelector) as HTMLButtonElement
let changeEventHook = false
export default Vue.extend({
  data() {
    return {
      value: originalTextArea.value,
    }
  },
  mounted() {
    originalTextArea.addEventListener('input', this.listenChange)
    originalTextArea.addEventListener('change', this.listenChange)
    if (!changeEventHook) {
      const original = Object.getOwnPropertyDescriptors(
        HTMLTextAreaElement.prototype,
      ).value
      Object.defineProperty(originalTextArea, 'value', {
        ...original,
        set(value: string) {
          original.set?.call(this, value)
          raiseEvent(originalTextArea, 'input')
        },
      })
      changeEventHook = true
    }
  },
  beforeDestroy() {
    originalTextArea.removeEventListener('input', this.listenChange)
    originalTextArea.removeEventListener('change', this.listenChange)
  },
  methods: {
    updateValue(newValue: string) {
      originalTextArea.value = newValue
      raiseEvent(originalTextArea, 'input')
    },
    send() {
      if (!sendButton.disabled) {
        this.value = ''
        sendButton.click()
      }
    },
    listenChange(e: InputEvent) {
      this.value = (e.target as HTMLTextAreaElement).value
    },
  },
})
</script>
<style lang="scss">
.bilibili-live-player-video-controller-content {
  .danmaku-send-bar {
    display: none;
  }
}
.bilibili-live-player-video-controller-container {
  background-image: linear-gradient(
    to bottom,
    transparent 20%,
    rgba(0, 0, 0, 0.9)
  );
}
@media screen and (min-width: 1038px) {
  .player-full-win,
  .fullscreen-fix {
    &:not(.danmaku-send-bar-unloaded) {
      .bilibili-live-player-video-controller-content {
        // 不准 float 布局
        display: flex;
        justify-content: space-between;
        align-items: center;
        &::before,
        &::after {
          content: none !important;
        }
        .danmaku-send-bar {
          display: flex;
          margin: 0 24px;
          flex: 1 1 0;
          height: 24px;
          justify-content: center;
          align-items: center;
          input {
            border: none;
            border-bottom: 2px solid #fff8;
            background-color: transparent;
            color: #fff;
            padding: 4px;
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
      }
    }
  }
}
</style>
