<template>
  <div class="fresh-home-sub-header">
    <div class="fresh-home-sub-header-dot"></div>
    <slot />
  </div>
</template>
<style lang="scss">
@import 'common';

.fresh-home-sub-header {
  @include h-center(6px);
  &-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: var(--theme-color);
  }
}
</style>
