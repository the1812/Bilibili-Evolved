<template>
  <div
    class="be-button"
    role="button"
    :aria-disabled="disabled"
    :tabindex="disabled ? -1 : 0"
    :class="{ [type]: true, disabled, round, icon }"
    v-on="disabled ? null : $listeners"
    @keydown.enter.prevent="$listeners.click && $listeners.click($event)"
    @keydown.space.prevent="$listeners.click && $listeners.click($event)"
  >
    <div class="content-container">
      <slot>Button</slot>
    </div>
  </div>
</template>

<script lang="ts">
export default Vue.extend({
  name: 'VButton',
  props: {
    type: {
      type: String,
      default: 'light',
    },
    round: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    disabled() {
      return Boolean(this.$attrs.disabled)
    },
  },
})
</script>

<style lang="scss" scoped>
.be-button {
  outline: none !important;
  line-height: normal;
  transition: background-color 0.2s ease-out, box-shadow 0.2s ease-out;
  background-color: #8882;
  color: black;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  &,
  & * {
    -webkit-tap-highlight-color: transparent;
  }
  body.dark & {
    color: #eee;
  }
  &.round {
    border-radius: calc(1em + 8px);
    padding: 4px 10px;
  }
  &.icon {
    border-radius: 50%;
    padding: 4px;
    // b 站样式会塞个背景图
    background-image: none !important;
  }

  .content-container {
    user-select: none;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
  }
  &.transparent {
    background-color: transparent;
  }
  &.primary {
    box-shadow: 0 0 0 1px var(--theme-color-80);
    background-color: var(--theme-color-80);
    color: var(--foreground-color);
  }
  &.light {
    background-color: #fff;
    box-shadow: 0 0 0 1px #8884;
    transition: box-shadow 0.2s ease-out;
  }
  body.dark &.light {
    background-color: #333;
    // box-shadow: 0 0 0 1px transparent;
  }
  &:not(.disabled) {
    &:hover,
    &:focus-within {
      background-color: #8884;
    }
    &:focus-within {
      box-shadow: 0 0 0 1px var(--theme-color), 0 0 0 3px var(--theme-color-20);
    }
    &.transparent {
      &:hover,
      &:focus-within {
        background-color: #8882;
      }
    }
    &.primary {
      &:hover {
        box-shadow: 0 0 0 1px var(--theme-color);
      }
      &:focus-within {
        box-shadow: 0 0 0 1px var(--theme-color), 0 0 0 3px var(--theme-color-20);
      }
      &:hover,
      &:focus-within {
        background-color: var(--theme-color);
      }
    }
    &.light {
      &:hover {
        background-color: #fff;
        box-shadow: 0 0 0 1px var(--theme-color);
      }
      &:active,
      &:focus-within {
        background-color: #fff;
        box-shadow: 0 0 0 1px var(--theme-color), 0 0 0 3px var(--theme-color-20);
      }
    }
    body.dark &.light {
      &:hover {
        background-color: #333;
        box-shadow: 0 0 0 1px var(--theme-color);
      }
      &:active,
      &:focus-within {
        background-color: #333;
        box-shadow: 0 0 0 1px var(--theme-color), 0 0 0 3px var(--theme-color-20);
      }
    }
  }
  &.disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}
</style>
