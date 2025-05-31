<!-- 这个 Vue 组件是因为无法正常从 @/components/SwitchOptions.vue 导入 SwitchOptions 组件而新建的 -->

<template>
  <div class="switch-options-min">
    <div class="switch-options-min-grid">
      <component
        :is="options.radio ? 'RadioButton' : 'CheckBox'"
        v-for="name of Object.keys(options.switches)"
        :key="name"
        :class="{ dim: !(Number(componentOptions[name]) ^ Number(isDimAtChecked)) }"
        v-bind="mergedSwitchProps"
        :checked="componentOptions[name]"
        @change="componentOptions[name] = $event"
      >
        <!-- dim 这里原来的写法在使用 export default defineComponent 的情况下会报错，虽然能运行，但还是改了改 -->
        {{ options.switches[name].displayName }}
      </component>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { CheckBox, RadioButton } from '@/ui'
import { getComponentSettings } from '@/core/settings'

export default defineComponent({
  name: 'SwitchOptionsMin',

  components: {
    CheckBox,
    RadioButton,
  },

  props: {
    options: {
      type: Object,
      required: true,
    },
  },

  data() {
    const { componentName } = this.options
    const componentOptions = getComponentSettings(componentName).options
    const getIsDimAtChecked = () => {
      if (this.options.dimAt === 'checked' || this.options.dimAt === undefined) {
        return true
      }
      if (this.options.dimAt === 'notChecked') {
        return false
      }
      return false
    }
    const isDimAtChecked = getIsDimAtChecked()

    return {
      componentOptions,
      isDimAtChecked,
    }
  },

  computed: {
    mergedSwitchProps() {
      return {
        checkedIcon: 'mdi-eye-off-outline',
        notCheckedIcon: 'mdi-eye-outline',
        ...this.options.switchProps,
      }
    },
  },

  watch: {
    options() {
      this.updateColumnsCount()
    },
  },

  mounted() {
    this.updateColumnsCount()
  },

  methods: {
    updateColumnsCount() {
      const element = this.$el as HTMLElement
      const columns = Math.ceil(Object.keys(this.options.switches).length / 12)
      element.style.setProperty('--columns', columns.toString())
    },
  },
})
</script>

<style lang="scss">
@import 'common';

.switch-options-min {
  position: relative;
  --columns: 1;
  width: 100%;

  .switch-icon {
    margin-right: 8px;
    transform: scale(0.9);
  }

  .dim {
    opacity: 0.5;
  }

  & > &-grid {
    font-size: 12px;
    display: grid;
    grid-template-columns: repeat(auto-fill, 50%);
  }
}
</style>
