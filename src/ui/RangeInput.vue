<template>
  <div class="be-range-input">
    <TextBox
      change-on-blur
      :text="wrapper.range.start.toString()"
      @change="wrapper.start = $event"
    ></TextBox>
    <slot name="separator">
      <div class="default-separator">~</div>
    </slot>
    <TextBox
      change-on-blur
      :text="wrapper.range.end.toString()"
      @change="wrapper.end = $event"
    ></TextBox>
  </div>
</template>

<script lang="ts">
const createWrapper = (instance: any) => {
  const wrapper = {
    range: instance.range,
    get start() {
      return this.range.start.toString()
    },
    set start(value: string) {
      this.createNewRange(value, this.end)
    },
    get end() {
      return this.range.end.toString()
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
      instance.$emit('change', newRange)
    },
  }
  return wrapper
}
export default Vue.extend({
  name: 'RangeInput',
  components: {
    TextBox: () => import('./TextBox.vue'),
  },
  model: {
    prop: 'range',
    event: 'change',
  },
  props: {
    range: {
      type: Object,
      required: true,
    },
    validator: {
      type: Function,
      default: undefined,
    },
  },
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
