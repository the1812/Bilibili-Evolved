<template>
  <HomeRedesignBase>
    <div class="fresh-home">
      <div class="fresh-home-content-layout">
        <FreshLayoutItem
          v-for="layout of layouts"
          :key="layout.name"
          :item="layout"
        />
      </div>
    </div>
  </HomeRedesignBase>
</template>
<script lang="ts">
import HomeRedesignBase from '../HomeRedesignBase.vue'
import FreshLayoutItem from './FreshLayoutItem.vue'
import { layouts } from './layouts/layouts'

export default Vue.extend({
  components: {
    HomeRedesignBase,
    FreshLayoutItem,
  },
  data() {
    return {
      layouts,
    }
  },
})
</script>
<style lang="scss">
@import "common";

.fresh-home {
  padding: 24px;
  width: 100%;
  max-width: var(--home-max-width, unset);
  @include v-stretch();
  &-header {
    @include h-center();
    justify-content: space-between;
    margin-bottom: 16px;
    &-title {
      color: var(--home-color);
      font-weight: bold;
      font-size: 20px;
    }
    &-more {
      @include semibold();
      .be-icon {
        transition: .3s ease-out;
        margin-right: 6px;
      }
      &:hover .be-icon {
        transform: rotate(0.5turn);
      }
    }
  }
  &-content-layout {
    @include h-stretch();
    flex-wrap: wrap;
    gap: 12px 24px;
  }
}
</style>
