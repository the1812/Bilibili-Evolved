<template>
  <div class="be-loading">
    <slot>
      <template v-if="typeof config.content === 'string' && config.content.length > 0">
        {{ config.content }}
      </template>
      <component
        :is="markRaw(config.content)"
        v-if="typeof config.content !== 'string'"
      ></component>
    </slot>
  </div>
</template>
<script lang="ts">
import { defineComponent, markRaw } from 'vue'
import { loadingContent } from './v-loading'

export default defineComponent({
  name: 'VLoading',
  setup: () => ({ markRaw }),
  data() {
    return {
      config: loadingContent,
    }
  },
})
</script>
<style lang="scss">
@import 'common';
.be-loading {
  flex-grow: 1;
  @include h-center();
  justify-content: center;
}
</style>
