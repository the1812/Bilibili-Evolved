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
import { select } from '@/core/spin-query'
import { raiseEvent } from '@/core/utils'
import { originalTextAreaSelector, sendButtonSelector } from './original-elements'

let changeEventHook = false
export default Vue.extend({
  data() {
    return {
      originalTextArea: null,
      sendButton: null,
      value: '',
    }
  },
  async mounted() {
    const originalTextArea = (await select(originalTextAreaSelector)) as HTMLTextAreaElement
    const sendButton = (await select(sendButtonSelector)) as HTMLButtonElement
    if (!originalTextArea || !sendButton) {
      throw new Error(
        `[danmakuSendBar] ref elements not found. originalTextArea = ${
          originalTextArea === null
        } sendButton = ${sendButton === null}`,
      )
    }
    // console.log(originalTextArea, sendButton)
    this.originalTextArea = originalTextArea
    this.sendButton = sendButton
    this.value = originalTextArea.value
    originalTextArea.addEventListener('input', this.listenChange)
    originalTextArea.addEventListener('change', this.listenChange)
    if (!changeEventHook) {
      const original = Object.getOwnPropertyDescriptors(HTMLTextAreaElement.prototype).value
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
    this.originalTextArea.removeEventListener('input', this.listenChange)
    this.originalTextArea.removeEventListener('change', this.listenChange)
  },
  methods: {
    updateValue(newValue: string) {
      this.originalTextArea.value = newValue
      raiseEvent(this.originalTextArea, 'input')
    },
    send() {
      if (!this.sendButton.disabled) {
        this.value = ''
        this.sendButton.click()
      }
    },
    listenChange(e: InputEvent) {
      this.value = (e.target as HTMLTextAreaElement).value
    },
  },
})
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
    &:not(.danmaku-send-bar-unloaded) {
      .live-web-player-controller .control-area {
        .danmaku-send-bar {
          display: flex;
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
}
</style>
