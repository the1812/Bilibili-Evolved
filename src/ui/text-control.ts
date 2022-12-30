export const textControlMixin = Vue.extend({
  model: {
    prop: 'text',
    event: 'change',
  },
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
      type: Function,
      default: undefined,
    },
  },
  data() {
    return {
      composing: false,
      restListeners: lodash.omit(
        this.$listeners,
        'change',
        'input',
        'compositionstart',
        'compositionend',
      ),
    }
  },
  methods: {
    emitChange() {
      let { value } = this.$refs.input
      if (this.validator) {
        value = this.validator(value, this.text)
        if (this.changeOnBlur) {
          this.$refs.input.value = value
        }
      }
      if (value === this.text) {
        return
      }
      this.$emit('change', value)
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
      this.$refs.input.focus()
    },
  },
})
