<template>
  <HomeRedesignBase>
    <div class="fresh-home">
      <div class="fresh-home-content-layout">
        <FreshLayoutItem v-for="layout of layouts" :key="layout.name" :item="layout" />
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
@import 'common';
@import 'tabs';

.fresh-home {
  padding: 16px 36px;
  width: 100%;
  max-width: var(--home-max-width, unset);
  @include v-stretch();
  &-header {
    @include h-center();
    justify-content: space-between;
    margin-bottom: 16px;
    &-center-area {
      flex: 1;
      margin: 0 24px;
      @include h-center();
    }
    &-grow {
      flex: 1;
    }
    &-tabs {
      @include tabs-style();
      .default-tabs {
        padding: 4px 8px;
      }
    }
    &-title {
      color: var(--home-color);
      @include semi-bold();
      font-size: 20px;
      line-height: 28px;
    }
    &-pagination {
      @include h-center(8px);
      .be-button {
        .be-icon {
          transition: 0.3s ease-out;
        }
        .be-iconfont-left-arrow {
          transform: translateX(-0.5px);
        }
        .be-iconfont-right-arrow {
          transform: translateX(0.5px);
        }
        .mdi-refresh {
          margin: 1px;
          transition-duration: 0.5s;
        }
        &:hover .mdi-refresh {
          transform: rotate(1turn);
        }
      }
    }
    &-icon-button {
      @include semi-bold();
      font-size: 13px;
      &.be-button,
      .be-button {
        padding-left: 6px !important;
      }
      .be-icon {
        font-weight: normal;
        transition: 0.3s ease-out;
        margin-right: 6px;
      }
      &.rotate:hover .be-icon {
        transform: rotate(0.5turn);
      }
    }
  }
  &-content-layout {
    @include h-stretch();
    flex-wrap: wrap;
    gap: 8px 16px;
  }
}
</style>
