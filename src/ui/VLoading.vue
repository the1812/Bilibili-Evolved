<template>
  <div class="be-loading">
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
import { loadingContent as config } from './v-loading'
</script>
<style lang="scss">
@import 'common';
.be-loading {
  flex-grow: 1;
  @include h-center();
  justify-content: center;
}
</style>
