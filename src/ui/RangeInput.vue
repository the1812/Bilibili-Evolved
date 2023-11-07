<template>
  <div class="be-range-input">
    <TextBox
      change-on-blur
      :text="wrapper.range.start"
      @update:text="wrapper.start = $event"
    ></TextBox>
    <slot name="separator">
      <div class="default-separator">~</div>
    </slot>
    <TextBox change-on-blur :text="wrapper.range.end" @update:text="wrapper.end = $event"></TextBox>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import type { Range } from './range'

const createWrapper = (instance: any) => {
  const wrapper = {
    range: instance.range,
    get start() {
      return this.range.start
    },
    set start(value: string) {
      this.createNewRange(value, this.end)
    },
    get end() {
      return this.range.end
    },
    set end(value: string) {
      this.createNewRange(this.start, value)
    },
    createNewRange(start: string, end: string) {
      let newRange = { start, end }
      if (instance.validator) {
        newRange = instance.validator(newRange)
      }
      if (newRange === null || newRange === undefined) {
        this.range = {
          start: this.range.start,
          end: this.range.end,
        }
        return
      }
      this.range = newRange
      instance.$emit('update:range', newRange)
    },
  }
  return wrapper
}
export default defineComponent({
  name: 'RangeInput',
  components: {
    TextBox: () => import('./TextBox.vue'),
  },
  props: {
    range: {
      type: Object as PropType<Range<string>>,
      required: true,
    },
    validator: {
      type: Function as PropType<(range: Range<string>) => Range<string> | null | undefined>,
      default: undefined,
    },
  },
  emits: ['update:range'],
  data() {
    return {
      wrapper: createWrapper(this),
    }
  },
})
</script>

<style lang="scss" scoped>
.be-range-input {
  display: flex;
  align-items: center;
  > .be-textbox {
    flex: 1;
  }
  .default-separator {
    margin: 0 8px;
    flex: 0 0 auto;
  }
}
</style>
