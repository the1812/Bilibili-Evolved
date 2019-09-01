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
  position: relative;
  background-color: #8884;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 100px;

  .dropdown-menu {
    transform-origin: top;
    transform: scaleY(0) translateX(-50%);
    position: absolute;
    top: calc(100% + 2px);
    left: 50%;
    background-color: var(--download-video-background);
    z-index: 1;
    transition: 0.2s cubic-bezier(0.6, -0.28, 0.74, 0.05);
    box-shadow: rgba(0, 0, 0, 0.2) 0 4px 8px 0px;
    &.opened {
      transform: scaleY(1) translateX(-50%);
      transition-timing-function: cubic-bezier(0.18, 0.89, 0.32, 1.28);
    }
    li {
      padding: 4px 8px;
      white-space: nowrap;
      min-width: 80px;
      text-align: center;
      cursor: pointer;
      color: var(--download-video-foreground);
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