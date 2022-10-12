<template>
  <div class="be-loading">
    <slot>
      <template v-if="typeof config.content === 'string' && config.content.length > 0">
        {{ config.content }}
      </template>
      <component :is="config.content" v-if="typeof config.content !== 'string'"></component>
    </slot>
  </div>
</template>
<script lang="ts">
import { loadingContent } from './v-loading'

export default Vue.extend({
  name: 'VLoading',
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
