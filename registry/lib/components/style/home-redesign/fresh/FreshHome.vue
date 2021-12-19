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
  padding: 12px;
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
    &-pagination {
      @include h-center(8px);
      .be-button {
        .be-icon {
          transition: .3s ease-out;
        }
        .be-iconfont-left-arrow {
          transform: translateX(-0.5px);
        }
        .be-iconfont-right-arrow {
          transform: translateX(0.5px);
        }
        .mdi-reload {
          margin: 1px;
          position: relative;
          top: 0.5px;
          left: 0.5px;
        }
        &:hover .mdi-reload {
          transform: rotate(1turn);
        }
      }
    }
    &-more {
      @include semi-bold();
      font-size: 13px;
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
