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
  &.fill:not(.transparent) {
    .custom-navbar-item[data-name='search'] .main-content {
      background-color: #0001;
    }
    .launch-bar {
      opacity: 0.8;
      &:hover,
      &:focus-within {
        opacity: 1;
      }
    }
  }
  &:not(.transparent) {
    .custom-navbar-item[data-name='search'] .main-content {
      background-color: #8881;
    }
  }
  .launch-bar {
    --color: var(--custom-navbar-foreground);
    opacity: 0.5;
    transition: opacity 0.2s ease-out;
    &:hover,
    &:focus-within {
      opacity: 1;
    }
    .input-area .launch-bar-form .input {
      padding: 8px 6px;
    }
  }
}
.custom-navbar-search {
  align-self: stretch;
  display: flex;
}
</style>
