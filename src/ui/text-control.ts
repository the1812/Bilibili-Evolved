import type { SetupContext, Ref, PropType, ComputedRef } from 'vue'
import { ref, computed } from 'vue'

export const textControlProps = {
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
    type: Function as PropType<(value: string, oldValue: string) => string | undefined>,
    default: undefined,
  },
}

export const useTextControl = (
  props: {
    text: string
    changeOnBlur: boolean
    validator: (value: string, oldValue: string) => string | undefined
  },
  { attrs, emit }: SetupContext<{ 'update:text': (value: string) => boolean }>,
): {
  inputRef: Ref<HTMLInputElement | null>
  composing: Ref<boolean>
  restAttrs: ComputedRef<Record<string, unknown>>
  emitChange: () => void
  input: () => void
  change: () => void
  compositionStart: () => void
  compositionEnd: () => void
  focus: () => void
} => {
  const inputRef = ref(null) as Ref<HTMLInputElement | null>
  const composing = ref(false) as Ref<boolean>
  const restAttrs = computed(() =>
    lodash.omit(attrs, 'onChange', 'onInput', 'onCompositionstart', 'onCompositionend'),
  )

  const emitChange = () => {
    let { value } = inputRef.value
    if (props.validator) {
      value = props.validator(value, props.text)
      if (props.changeOnBlur) {
        inputRef.value.value = value
      }
    }
    if (value === props.text) {
      return
    }
    emit('update:text', value)
  }

  const input = () => {
    if (!props.changeOnBlur && !composing.value) {
      emitChange()
    }
  }

  const change = () => {
    if (props.changeOnBlur && !composing.value) {
      emitChange()
    }
  }

  const compositionStart = () => {
    composing.value = true
  }

  const compositionEnd = () => {
    composing.value = false
    input()
  }

  const focus = () => {
    inputRef.value.focus()
  }

  return {
    inputRef,
    composing,
    restAttrs,
    emitChange,
    input,
    change,
    compositionStart,
    compositionEnd,
    focus,
  }
}
