<template>
  <div class="switch-options" :class="{ 'small-size': smallSize, grid: !popupMode }">
    <template v-if="popupMode">
      <VButton ref="button" @click="popupOpen = !popupOpen">
        <VIcon
          class="switch-icon"
          icon="mdi-checkbox-marked-circle-outline"
          :size="smallSize ? 16 : 24"
        ></VIcon>
        {{ options.optionDisplayName }}
      </VButton>
      <VPopup
        v-model="popupOpen"
        class="switch-options-popup widgets-popup"
        :trigger-element="$refs.button"
        esc-close
        auto-destroy
      >
        <component
          :is="options.radio ? 'RadioButton' : 'CheckBox'"
          v-for="name of Object.keys(options.switches)"
          :key="name"
          :class="{ dim: isDim(name) }"
          v-bind="mergedSwitchProps"
          :checked="componentOptions[`switch-${name}`]"
          @change="componentOptions[`switch-${name}`] = $event"
        >
          {{ options.switches[name].displayName }}
        </component>
      </VPopup>
    </template>
    <template v-else>
      <div class="switch-options-grid">
        <component
          :is="options.radio ? 'RadioButton' : 'CheckBox'"
          v-for="name of Object.keys(options.switches)"
          :key="name"
          :class="{ dim: isDim(name) }"
          v-bind="mergedSwitchProps"
          :checked="componentOptions[`switch-${name}`]"
          @change="componentOptions[`switch-${name}`] = $event"
        >
          {{ options.switches[name].displayName }}
        </component>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { VPopup, VButton, VIcon, CheckBox, RadioButton } from '@/ui'
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
    smallSize: {
      type: Boolean,
      default: false,
    },
    popupMode: {
      type: Boolean,
      default: true,
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
    isDim(name: string) {
      if (this.options.dimAt === 'checked' || this.options.dimAt === undefined) {
        return this.componentOptions[`switch-${name}`]
      }
      if (this.options.dimAt === 'notChecked') {
        return !this.componentOptions[`switch-${name}`]
      }
      return false
    },
  },
})
</script>

<style lang="scss">
@import 'common';
.switch-options {
  position: relative;
  --columns: 1;
  &.grid {
    width: 100%;
  }
  .switch-icon {
    margin-right: 8px;
    opacity: 0.75;
    transform: scale(0.9);
  }
  .dim {
    opacity: 0.5;
  }
  &-grid {
    font-size: 12px;
    display: grid;
    grid-template-columns: repeat(auto-fill, 50%);
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
    width: max-content;
    grid-template-columns: repeat(var(--columns), auto);
    border-radius: 5px;
    border: 1px solid #8882;
    max-height: calc(100vh - 100px);
    @include no-scrollbar();

    &.open {
      transform: translateY(-50%) scale(1);
    }
    body.settings-panel-dock-right & {
      right: calc(100% + 8px);
      left: unset;
      transform-origin: right;
    }
  }
  &.small-size .switch-options-popup {
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
