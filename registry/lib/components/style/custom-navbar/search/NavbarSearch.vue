<template>
  <div class="custom-navbar-search">
    <LaunchBar></LaunchBar>
  </div>
</template>
<script lang="ts">
import LaunchBar from '@/components/launch-bar/LaunchBar.vue'

export default Vue.extend({
  components: {
    LaunchBar,
  },
})
</script>
<style lang="scss">
.custom-navbar {
  // transparent mode / no fill
  .launch-bar {
    --color: var(--custom-navbar-foreground);
    background-color: #000a;
    opacity: 0.5;
    transition: opacity 0.2s ease-out;
    padding: 2px 6px;
    border-radius: 8px;

    &:hover,
    &:focus-within {
      opacity: 1;
    }
    .input-area .launch-bar-form .input {
      padding: 8px 6px;
      width: var(--navbar-search-width);
    }
  }

  // normal mode
  &:not(.transparent) {
    .launch-bar {
      background-color: #8883;
    }
  }

  // fill mode
  &.fill:not(.transparent) {
    .launch-bar {
      background-color: #0002;
    }
  }
}
.custom-navbar-search {
  align-self: center;
  display: flex;
}
</style>
