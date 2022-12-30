<template>
  <div class="be-empty">
    <slot>
      <template v-if="typeof config.content === 'string' && config.content.length > 0">
        {{ config.content }}
      </template>
      <component :is="config.content" v-if="typeof config.content !== 'string'"></component>
    </slot>
  </div>
</template>
<script lang="ts">
import { emptyContent } from './v-empty'

export default Vue.extend({
  name: 'VEmpty',
  data() {
    return {
      config: emptyContent,
    }
  },
})
</script>
<style lang="scss">
@import 'common';
.be-empty {
  flex-grow: 1;
  @include h-center();
  justify-content: center;
}
</style>
