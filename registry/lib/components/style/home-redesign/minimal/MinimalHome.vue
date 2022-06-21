<template>
  <HomeRedesignBase>
    <div class="minimal-home">
      <div class="minimal-home-tabs">
        <div class="default-tabs">
          <MinimalHomeFeeds  @tab-change="onTabChange" />
          <MinimalHomeTrending @tab-change="onTabChange" />
        </div>
      </div>
    </div>
  </HomeRedesignBase>
</template>
<script lang="ts">
import HomeRedesignBase from '../HomeRedesignBase.vue'
import { minimalHomeOptions } from './options'
import MinimalHomeFeeds from './tabs/MinimalHomeFeeds.vue'
import MinimalHomeTrending from './tabs/MinimalHomeTrending.vue'
import { MinimalHomeTabOption } from './types'

const tabs = [
  MinimalHomeFeeds,
  MinimalHomeTrending,
]
export default Vue.extend({
  components: {
    HomeRedesignBase,
    MinimalHomeFeeds,
    MinimalHomeTrending,
  },
  data() {
    return {
      tabs,
      selectedTab: minimalHomeOptions.defaultTab,
    }
  },
  computed: {

  },
  methods: {
    onTabChange(newTab: MinimalHomeTabOption) {
      this.selectedTab = newTab
    },
  },
})
</script>
<style lang="scss">
@import 'common';
@import 'tabs';

/* TODO:
- 默认列数自适应
  - 720P 一列
  - 1080P 两列
  - 21:9 四列
*/
.minimal-home {
  &-tabs {
    @include tabs-style();
    .default-tabs {
      padding: 4px 8px;
    }
  }
}
</style>
