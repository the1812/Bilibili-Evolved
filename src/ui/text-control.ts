import { defineComponent } from 'vue'
import type { PropType } from 'vue'

export const textControlMixin = defineComponent({
  inheritAttrs: false,
  props: {
    text: {
      type: String,
      required: false,
      default: '',
    },
    changeOnBlur: {
      type: Boolean,
      required: false,
      default: false,
    },
    validator: {
      type: Function as PropType<(value: string, oldValue: string) => string>,
      default: undefined,
    },
  },
  emits: ['update:text'],
  data() {
    return {
      composing: false,
      restAttrs: lodash.omit(
        this.$attrs,
        'onChange',
        'onInput',
        'onCompositionstart',
        'onCompositionend',
      ),
    }
  },
  methods: {
    emitChange() {
      const input = (this.$refs as any).input as { value: any }
      let { value } = input
      if (this.validator) {
        value = this.validator(value, this.text)
        if (this.changeOnBlur) {
          input.value = value
        }
      }
      if (value === this.text) {
        return
      }
      this.$emit('update:text', value)
    },
    input() {
      if (!this.changeOnBlur && !this.composing) {
        this.emitChange()
      }
    },
    change() {
      if (this.changeOnBlur && !this.composing) {
        this.emitChange()
      }
    },
    compositionStart() {
      this.composing = true
    },
    compositionEnd() {
      this.composing = false
      this.input()
    },
    focus() {
      ;(this.$refs as any).input.focus()
    },
  },
})
