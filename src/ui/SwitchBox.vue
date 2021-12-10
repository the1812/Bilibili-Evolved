<template>
  <div
    class="be-switch-box"
    :class="{ checked, disabled }"
    role="switch"
    :aria-checked="checked"
    :aria-disabled="disabled"
    tabindex="0"
    @keydown.space.prevent="toggle()"
    @keydown.enter.prevent="toggle()"
  >
    <label>
      <input
        ref="input"
        type="checkbox"
        :disabled="disabled"
        :checked="checked"
        @change.stop="$emit('change', $event.target.checked)"
      />
      <div class="bar">
        <div class="thumb"></div>
      </div>
    </label>
  </div>
</template>

<script lang="ts">
export default Vue.extend({
  name: 'SwitchBox',
  model: {
    prop: 'checked',
    event: 'change',
  },
  props: {
    checked: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    toggle() {
      if (this.disabled) {
        return
      }
      this.$refs.input.checked = !this.$refs.input.checked
      this.$emit('change', this.$refs.input.checked)
    },
  },
})
</script>

<style lang="scss">
@import './common';
.be-switch-box {
  @include default-transition();
  outline: none !important;
  width: 32px;
  margin: 4px 0;
  input[type='checkbox'] {
    display: none;
  }
  label {
    display: block;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .bar {
    position: relative;
    background-color: #8884;
    // box-shadow: 0 1px 4px 0 #0004 inset;
    @include round-bar(12);
    .thumb {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background-color: #fff;
      border: 1px solid #ddd;
      // box-shadow: 0 1px 8px 0px #0004;
      body.dark & {
        border-color: #555;
        background-color: #666;
      }
    }
  }
  &.checked {
    .bar {
      background-color: var(--theme-color-50);
      .thumb {
        background-color: var(--theme-color);
        border-color: transparent;
        left: calc(100% - 18px);
        body.dark & {
          border-color: transparent;
          background-color: var(--theme-color);
        }
      }
    }
  }
  &:focus-within.checked {
    .thumb {
      box-shadow: 0 0 0 1px var(--theme-color-20);
    }
  }
  &.disabled {
    &,
    & * {
      cursor: not-allowed;
    }
    opacity: 0.5;
  }
}
</style>
