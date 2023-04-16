<template>
  <div class="fresh-home-compact-rank-list" :class="{ loading, loaded }">
    <div v-if="!loaded" class="fresh-home-compact-rank-list-loading-container">
      <VLoading v-if="loading" />
      <div
        v-if="(error || items.length === 0) && !loading"
        class="fresh-home-compact-rank-list-empty"
      >
        <VEmpty />
        <VButton class="fresh-home-compact-rank-list-refresh-button" round @click="reload">
          <VIcon icon="mdi-refresh" />
          刷新
        </VButton>
      </div>
    </div>
    <template v-if="loaded"> content </template>
  </div>
</template>
<script lang="ts">
import { VIcon, VLoading, VEmpty, VButton } from '@/ui'
import { cssVariableMixin, requestMixin } from '../../../../mixin'
import { compactRankListCssVars } from './rank-list'

export default Vue.extend({
  components: {
    // DpiImage,
    // UpInfo,
    VIcon,
    VLoading,
    VEmpty,
    VButton,
  },
  mixins: [requestMixin(), cssVariableMixin(compactRankListCssVars)],
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
@import './rank-list';

.fresh-home-compact-rank-list {
  @include v-stretch();
  width: var(--panel-width);
  height: var(--panel-height);
  min-height: var(--panel-height);
  padding: var(--padding);
  margin: calc(0px - var(--padding));

  @include rank-list-common();
}
</style>
