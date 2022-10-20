<template>
  <div
    v-hit="hit"
    class="be-dropdown"
    role="combobox"
    :class="{ disabled, round }"
    :tabindex="disabled ? -1 : 0"
    :aria-disabled="disabled"
  >
    <div ref="selected" class="selected">
      <div class="selected-item">
        <slot v-if="value !== null && value !== undefined" name="item" :item="value">
          {{ value.displayName }}
        </slot>
      </div>
      <div class="arrow" :class="{ open: popupOpen }">
        <slot name="arrow">
          <div class="default-arrow">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              viewBox="0 0 24 24"
            >
              <defs>
                <clipPath id="clip-arrow-down">
                  <rect width="24" height="24" />
                </clipPath>
              </defs>
              <g id="arrow-down" clip-path="url(#clip-arrow-down)">
                <path
                  id="Path_1"
                  data-name="Path 1"
                  d="M2,17,12,7,22,17"
                  transform="translate(24 25) rotate(180)"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                />
              </g>
            </svg>
          </div>
        </slot>
      </div>
    </div>
    <VPopup
      ref="popup"
      v-model="popupOpen"
      class="dropdown-popup"
      :lazy="false"
      :trigger-element="$refs.selected"
      @keydown.esc="selectItem(value)"
    >
      <div
        v-for="item of items"
        :key="keyMapper(item)"
        v-hit="() => selectItem(item)"
        class="bex-dropdown-item"
        :tabindex="popupOpen ? 0 : -1"
      >
        <slot name="item" :item="item">
          {{ item.displayName }}
        </slot>
      </div>
    </VPopup>
  </div>
</template>

<script lang="ts">
import VPopup from './VPopup.vue'

export default Vue.extend({
  name: 'VDropdown',
  components: {
    VPopup,
  },
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: {
      required: true,
    },
    items: {
      type: Array,
      required: true,
    },
    keyMapper: {
      type: Function,
      default: (item: any) => item.name,
    },
    round: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      popupOpen: false,
    }
  },
  computed: {
    disabled() {
      return Boolean(this.$attrs.disabled)
    },
  },
  watch: {
    disabled(value: boolean) {
      if (value) {
        this.popupOpen = false
      }
    },
  },
  created() {
    if (this.value === null || this.value === undefined) {
      this.$emit('change', this.items[0] || '<No items>')
    }
  },
  methods: {
    selectItem(item: any) {
      if (item !== this.value) {
        this.$emit('change', item)
      }
      this.popupOpen = false
      this.$el.focus()
    },
    hit(event: Event) {
      if (this.disabled) {
        return
      }
      const popup = this.$refs.popup.$el as HTMLElement
      const target = event.target as HTMLElement
      if (popup !== target && !popup.contains(target)) {
        this.popupOpen = !this.popupOpen
      }
      // if (this.popupOpen) {
      //   if (popup.firstElementChild instanceof HTMLElement) {
      //     popup.firstElementChild.focus()
      //   }
      // }
    },
  },
})
</script>

<style lang="scss" scoped>
@import './common';
.be-dropdown {
  display: flex;
  @include round-corner(4px);
  @include text-color();
  background-color: #fff;
  transition: box-shadow 0.2s ease-out;
  box-shadow: 0 0 0 1px #8884;
  position: relative;
  cursor: pointer;
  &,
  & * {
    -webkit-tap-highlight-color: transparent;
    outline: none !important;
  }
  body.dark & {
    background-color: #333;
  }
  &:not(.disabled) {
    &:hover {
      box-shadow: 0 0 0 1px var(--theme-color);
    }
    &:active,
    &:focus-within {
      box-shadow: 0 0 0 1px var(--theme-color), 0 0 0 3px var(--theme-color-20);
    }
  }
  .dropdown-popup {
    background-color: inherit;
    top: calc(100% + 4px);
    left: 50%;
    transform: translateX(-50%) translateY(-4px) scale(0.8);
    transform-origin: top;
    transition: 0.2s ease-out;
    min-width: 100%;
    @include shadow();
    border: 1px solid #8882;
    box-sizing: border-box;
    &.open {
      transform: translateX(-50%) scale(1);
    }
    // 佛了 .dropdown-item, .be-dropdown-item 全会撞车
    .bex-dropdown-item {
      padding: 4px 6px;
      margin: 2px 4px;
      border-radius: 4px;
      white-space: nowrap;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s ease-out;
      &:hover,
      &:focus-within {
        background-color: #8882;
      }
      &:first-child {
        // border-radius: 7px 7px 0 0;
        margin-top: 4px;
        // padding-top: 6px;
      }
      &:last-child {
        // border-radius: 0 0 7px 7px;
        margin-bottom: 4px;
        // padding-bottom: 6px;
      }
    }
  }
  .selected {
    display: flex;
    align-items: center;
    flex-grow: 1;
    line-height: normal;
    &-item {
      flex: 1;
      padding: 4px 8px;
    }
    .arrow {
      flex-shrink: 0;
      transition: transform 0.2s ease-out;
      &.open {
        transform: rotate(180deg);
      }
      .default-arrow {
        padding: 0 6px;
        display: flex;
        align-items: center;
        path {
          fill: transparent;
        }
        svg {
          transition: 0.2s ease-out;
          stroke: #888a;
          fill: transparent;
          width: 12px;
          height: 12px;
        }
      }
    }
  }
  &:not(.disabled) {
    &:hover,
    &:active,
    &:focus-within {
      .selected .arrow .default-arrow svg {
        stroke: var(--theme-color);
      }
    }
  }
  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  &.round {
    border-radius: calc(1em + 8px);
    .selected-item {
      padding: 4px 10px;
    }
    // .bex-dropdown-item {
    //   &:first-child {
    //     border-radius: 7px 7px 0 0;
    //   }
    //   &:last-child {
    //     border-radius: 0 0 7px 7px;
    //   }
    // }
  }
}
</style>
