<template>
  <div class="be-textbox" role="textbox" :class="{ linear }">
    <input
      ref="input"
      type="text"
      v-bind="$attrs"
      :value="text"
      v-on="restListeners"
      @change.stop="change"
      @input.stop="input"
      @compositionstart="compositionStart"
      @compositionend="compositionEnd"
    />
    <div v-if="linear" class="linear-bar"></div>
  </div>
</template>

<script lang="ts">
import { textControlMixin } from './text-control'

export default Vue.extend({
  name: 'TextBox',
  mixins: [textControlMixin],
  props: {
    linear: {
      type: Boolean,
      default: false,
    },
  },
})
</script>

<style lang="scss" scoped>
.be-textbox {
  position: relative;
  flex: 1 1 32px;
  min-width: 32px;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  border-radius: 4px;
  transition: border 0.2s ease-out, box-shadow 0.2s ease-out;
  box-shadow: 0 0 0 1px #8884, 0 0 0 0px var(--theme-color-20);
  &:focus-within {
    box-shadow: 0 0 0 1px var(--theme-color), 0 0 0 3px var(--theme-color-20);
  }
  input[type='text'] {
    line-height: normal;
    padding: 4px 6px;
    border-radius: 4px;
    flex: 1 0 0;
    background-color: transparent;
    border: none;
    outline: none !important;
    color: black;
    width: 0;
    font-size: inherit;
    body.dark & {
      color: #eee;
    }
    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    &::-webkit-input-placeholder {
      color: #888;
    }
  }
  &.linear {
    box-shadow: none;
    input[type='text'] {
      padding: 4px;
    }
    .linear-bar {
      position: absolute;
      top: calc(100% - 1px);
      left: 50%;
      transform: translateX(-50%);
      border-radius: 1px;
      height: 1px;
      width: 100%;
      background-color: #8884;
    }
    &:focus-within {
      box-shadow: none;
      .linear-bar {
        background-color: var(--theme-color);
      }
    }
  }
}
</style>
