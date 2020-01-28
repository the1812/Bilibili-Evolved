<template>
  <div class="v-dropdown" @click="toggleDropdown()">
    <span class="selected">{{ value }}</span>
    <ul class="dropdown-menu" :class="{ opened: dropdownOpen }">
      <li v-for="item in items" :key="item" :data-value="item" @click="select(item)">{{ item }}</li>
    </ul>
    <i class="mdi mdi-chevron-down"></i>
  </div>
</template>
<script lang="ts">
export default {
  props: ['items', 'value'],
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
      this.$emit('update:value', item)
      this.$emit('change', item)
    }
  }
}
</script>
<style lang="scss">
.v-dropdown {
  --background-color: #eee;
  position: relative;
  background-color: var(--background-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 100px;

  body.dark & {
    --background-color: #333;
  }
  .dropdown-menu {
    transform-origin: top;
    transform: translateY(-4px) translateX(-50%);
    pointer-events: none;
    opacity: 0;
    position: absolute;
    top: calc(100% + 2px);
    left: 50%;
    background-color: var(--background-color);
    z-index: 1;
    transition: 0.2s ease-out;
    box-shadow: rgba(0, 0, 0, 0.2) 0 4px 8px 0px;
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
      &:hover {
        background-color: rgba(0, 0, 0, 0.16);
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

  .round-corner & {
    border-radius: var(--corner-radius);

    .dropdown-menu,
    .dropdown-menu li {
      border-radius: var(--corner-radius);
    }
  }
}
</style>