<template>
  <CheckBox
    class="be-radio-button"
    role="radio"
    v-bind="$attrs"
    :checked="checked"
    :checked-icon="checkedIcon"
    :not-checked-icon="notCheckedIcon"
    @change="emitChange($event)"
  >
    <slot>RadioButton</slot>
  </CheckBox>
</template>

<script lang="ts">
import { CurriedFunction2 } from 'lodash'
import CheckBox from './CheckBox.vue'

type RadioGroup = {
  instance: Vue
  uncheck: () => void
}
const groups = new Map<string | HTMLElement, RadioGroup[]>()
const setGroup = lodash.curry((name: string | HTMLElement, instance: Vue, uncheck: () => void) => {
  if (groups.has(name)) {
    groups.get(name).push({ instance, uncheck })
  } else {
    groups.set(name, [{ instance, uncheck }])
  }
})
export default Vue.extend({
  name: 'RadioButton',
  components: {
    CheckBox,
  },
  model: {
    prop: 'checked',
    event: 'change',
  },
  props: {
    checked: {
      type: Boolean,
      required: true,
    },
    allowUncheck: {
      type: Boolean,
      default: false,
    },
    group: {
      type: String,
      default: '',
    },
    checkedIcon: {
      type: String,
      default: 'mdi-radiobox-marked',
    },
    notCheckedIcon: {
      type: String,
      default: 'mdi-radiobox-blank',
    },
  },
  watch: {
    checked(newValue: boolean) {
      if (newValue) {
        const group = this.group as string
        const thisElement = this.$el as HTMLElement
        let key: string | HTMLElement
        if (group === '') {
          key = thisElement.parentElement
        } else {
          key = group
        }
        groups.get(key).forEach(({ instance, uncheck }) => {
          if (instance !== this) {
            uncheck()
          }
        })
      }
    },
  },
  mounted() {
    const group = this.group as string
    const element = this.$el as HTMLElement
    const uncheck = () => this.$emit('change', false)
    let curriedSet: CurriedFunction2<Vue, () => void, void>
    if (group === '') {
      curriedSet = setGroup(element.parentElement)
    } else {
      curriedSet = setGroup(group)
    }
    curriedSet(this, uncheck)
  },
  methods: {
    emitChange(value: boolean) {
      if ((this.checked && this.allowUncheck) || !this.checked) {
        this.$emit('change', value)
      }
    },
  },
})
</script>
