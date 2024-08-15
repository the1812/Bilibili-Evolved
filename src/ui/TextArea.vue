<template>
  <div class="be-text-area" role="text">
    <textarea
      ref="input"
      type="text"
      v-bind="$attrs"
      :value="text"
      v-on="restListeners"
      @change.stop="change"
      @input.stop="input"
      @compositionstart="compositionStart"
      @compositionend="compositionEnd"
    ></textarea>
  </div>
</template>
<script lang="ts">
import { textControlMixin } from './text-control'

export default Vue.extend({
  name: 'TextArea',
  mixins: [textControlMixin],
})
</script>
<style lang="scss">
.be-text-area {
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
  textarea {
    resize: none;
    field-sizing: content;
    width: 0;
    flex: 1 0 0;
    padding: 4px 6px;
    border-radius: 4px;
    background-color: transparent;
    overflow: auto;
    border: none;
    outline: none !important;
    color: black;
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
}
</style>
