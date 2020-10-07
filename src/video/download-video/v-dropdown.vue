<template>
  <div class="v-dropdown" @click="toggleDropdown()" :class="{round}" tabindex="0">
    <span class="selected">{{ value }}</span>
    <ul class="dropdown-menu" :class="{ opened: dropdownOpen }">
      <li v-for="item in items" :key="item" :data-value="item" @click="select(item)">{{ item }}</li>
    </ul>
    <i class="mdi mdi-chevron-down"></i>
  </div>
</template>
<script lang="ts">
export default {
  props: ['items', 'value', 'round'],
  data() {
    return {
      dropdownOpen: false
    }
  },
  methods: {
    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen
      if (this.dropdownOpen) {
        document.addEventListener(
          'click',
          e => {
            const target = e.target as HTMLElement
            if (target === this.$el || this.$el.contains(target)) {
              return
            }
            this.dropdownOpen = false
          },
          { once: true, capture: true }
        )
      }
    },
    select(item: string) {
      if (item !== this.value) {
        this.$emit('update:value', item)
        this.$emit('change', item)
      }
    }
  }
}
</script>
<style lang="scss">
.v-dropdown {
  --background-color: #fff;
  position: relative;
  background-color: var(--background-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 100px;
  border-radius: var(--corner-radius);
  line-height: 1.5;
  box-shadow: 0 0 0 1px #8884;

  &:focus {
    outline: none !important;
  }
  &:focus-within {
    box-shadow: 0 0 0 1px var(--theme-color);
  }
  body.dark & {
    --background-color: #222;
  }
  &.round {
    border-radius: 14px;
    padding: 0 4px;
  }
  .dropdown-menu {
    transform-origin: top;
    transform: translateY(-4px) translateX(-50%);
    pointer-events: none;
    opacity: 0;
    position: absolute;
    top: calc(100% + 1px);
    left: 50%;
    background-color: var(--background-color);
    z-index: 1;
    transition: 0.2s ease-out;
    box-shadow: 0 4px 8px 0 rgba(0,0,0,0.05);
    border: 1px solid #8882;
    border-radius: var(--corner-radius);
    &.opened {
      transform: translateY(0) translateX(-50%);
      pointer-events: initial;
      opacity: 1;
    }
    li {
      padding: 4px 16px;
      box-sizing: content-box;
      white-space: nowrap;
      min-width: 64px;
      text-align: center;
      cursor: pointer;
      color: inherit;
      background-color: transparent;
      border-radius: 3px;
      &:hover {
        background-color: #8882;
      }
    }
  }
  .mdi-chevron-down {
    font-size: 16pt;
    line-height: 1;
    transform: rotate(0deg);
  }
  .dropdown-menu.opened ~ .mdi-chevron-down {
    transform: rotate(180deg);
  }
  .selected {
    user-select: none;
    padding: 4px 8px;
  }
}
</style>