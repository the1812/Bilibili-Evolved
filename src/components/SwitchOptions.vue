<template>
  <div class="switch-options" :class="{ down: arrowDown }">
    <VButton ref="button" @click="popupOpen = !popupOpen">
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
        :checked="componentOptions['switch-' + name]"
        @change="componentOptions['switch-' + name] = $event"
      >
        {{ options.switches[name].displayName }}
      </component>
    </VPopup>
  </div>
</template>

<script lang="ts">
import { getComponentSettings } from '../core/settings'

export default Vue.extend({
  name: 'SwitchOptions',
  components: {
    VPopup: () => import('@/ui/VPopup.vue').then(m => m.default),
    VButton: () => import('@/ui/VButton.vue').then(m => m.default),
    VIcon: () => import('@/ui/icon/VIcon.vue').then(m => m.default),
    CheckBox: () => import('@/ui/CheckBox.vue').then(m => m.default),
    RadioButton: () => import('@/ui/RadioButton.vue').then(m => m.default),
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
  methods: {},
})
</script>

<style lang="scss" scoped>
@import "common";
.switch-options {
  position: relative;
  .switch-icon {
    margin-right: 8px;
    transform: scale(0.9);
  }
  &-popup {
    transition: .2s ease-out;
    transform-origin: left;
    transform: translateY(-50%) scale(0.9);
    top: 50%;
    left: calc(100% + 8px);
    @include default-background-color();
    @include shadow();
    white-space: nowrap;
    padding: 8px;
    display: flex;
    flex-direction: column;
    &.open {
      transform: translateY(-50%) scale(1);
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
