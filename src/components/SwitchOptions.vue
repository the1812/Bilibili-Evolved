<template>
  <div class="switch-options" :class="{ down: arrowDown }">
    <VButton
      ref="button"
      @click="popupOpen = !popupOpen"
    >
      <VIcon
        v-if="!arrowDown"
        class="switch-icon"
        icon="mdi-checkbox-marked-circle-outline"
        :size="22"
      ></VIcon>
      {{ options.optionDisplayName }}
      <VIcon v-if="!arrowDown" icon="right-arrow" :size="16"></VIcon>
      <VIcon v-else style="margin-left: 2px" icon="down-arrow" :size="16"></VIcon>
    </VButton>
    <VPopup
      v-model="popupOpen"
      class="switch-options-popup"
      :trigger-element="$refs.button"
      esc-close
      auto-destroy
    >
      <component
        :is="options.radio ? 'RadioButton' : 'CheckBox'"
        v-for="name of Object.keys(options.switches)"
        :key="name"
        :class="{ dim: isDim(name) }"
        v-bind="options.switchProps || {}"
        :checked="componentOptions['switch-' + name]"
        @change="componentOptions['switch-' + name] = $event"
      >
        {{ options.switches[name].displayName }}
      </component>
    </VPopup>
  </div>
</template>

<script lang="ts">
import {
  VPopup, VButton, VIcon, CheckBox, RadioButton,
} from '@/ui'
import { getComponentSettings } from '../core/settings'

export default Vue.extend({
  name: 'SwitchOptions',
  components: {
    VPopup,
    VButton,
    VIcon,
    CheckBox,
    RadioButton,
  },
  props: {
    options: {
      type: Object,
      required: true,
    },
    arrowDown: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    const { componentName } = this.options
    const componentOptions = getComponentSettings(componentName).options
    return {
      popupOpen: false,
      componentOptions,
    }
  },
  watch: {
    options() {
      this.updateColumnsCount()
    },
  },
  mounted() {
    this.updateColumnsCount()
    console.log(Object.keys(this.options.switches).map(key => `${key} : ${this.componentOptions[`switch-${key}`]}`))
  },
  methods: {
    updateColumnsCount() {
      const element = this.$el as HTMLElement
      const columns = Math.ceil(Object.keys(this.options.switches).length / 12)
      element.style.setProperty('--columns', columns.toString())
    },
    isDim(name: string) {
      return (this.componentOptions[`switch-${name}`] && this.options.dimAt === 'checked') || this.options.dimAt === 'notChecked'
    },
  },
})
</script>

<style lang="scss" scoped>
@import 'common';
.switch-options {
  position: relative;
  --columns: 1;
  .switch-icon {
    margin-right: 8px;
    transform: scale(0.9);
  }
  &-popup {
    font-size: 12px;
    transition: 0.2s ease-out;
    transform-origin: left;
    transform: translateY(-50%) scale(0.9);
    top: 50%;
    left: calc(100% + 8px);
    @include default-background-color();
    @include shadow();
    white-space: nowrap;
    padding: 4px;
    display: grid;
    grid-template-columns: repeat(var(--columns), auto);
    border-radius: 5px;
    border: 1px solid #8882;
    &.open {
      transform: translateY(-50%) scale(1);
    }
    .dim {
      opacity: .5;
    }
  }
  &.down .switch-options-popup {
    transform-origin: top;
    top: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%) scale(0.9);
    &.open {
      transform: translateX(-50%) scale(1);
    }
  }
}
</style>
