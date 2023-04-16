<template>
  <div class="bangumi-compact-rank-list">compact rank list</div>
</template>
<script lang="ts">
import { requestMixin } from '../../../../mixin'

export default Vue.extend({
  mixins: [requestMixin()],
  props: {
    parseJson: {
      type: Function,
      required: true,
    },
  },
})
</script>
<style lang="scss">
@import 'common';

.bangumi-compact-rank-list {
  @include v-stretch();
}
</style>
