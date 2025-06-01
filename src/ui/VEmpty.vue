<template>
  <div class="be-empty">
    <slot>
      <template v-if="typeof config.content === 'string' && config.content.length > 0">
        {{ config.content }}
      </template>
      <component :is="config.content as Component" v-if="typeof config.content !== 'string'" />
    </slot>
  </div>
</template>
<script lang="ts" setup>
import type { Component } from 'vue'
import { emptyContent as config } from './v-empty'
</script>
<style lang="scss">
@import 'common';
.be-empty {
  flex-grow: 1;
  @include h-center();
  justify-content: center;
}
</style>
