<template>
  <HomeRedesignBase>
    <div class="minimal-home">
      <TabControl class="minimal-home-tabs" :default-tab="defaultTab" :tabs="tabs" />
    </div>
  </HomeRedesignBase>
</template>
<script lang="ts">
import { addComponentListener } from '@/core/settings'
import { TabControl } from '@/ui'
import { TabMappings } from '@/ui/tab-mapping'
import HomeRedesignBase from '../HomeRedesignBase.vue'
import { minimalHomeOptions } from './options'
import { MinimalHomeTabOption } from './types'

const tabs: TabMappings = [
  {
    name: MinimalHomeTabOption.Feeds,
    displayName: '动态',
    component: () => import('./tabs/Feeds.vue').then(m => m.default),
    activeLink: 'https://t.bilibili.com/?tab=video',
  },
  {
    name: MinimalHomeTabOption.Trending,
    displayName: minimalHomeOptions.personalized ? '推荐' : '热门',
    component: () => import('./tabs/Trending.vue').then(m => m.default),
    activeLink: 'https://www.bilibili.com/v/popular/all',
  },
]
export default Vue.extend({
  components: {
    HomeRedesignBase,
    TabControl,
  },
  data() {
    return {
      tabs,
      defaultTab: minimalHomeOptions.defaultTab,
    }
  },
  mounted() {
    const columnCountKey = '--minimal-home-column-count-override'
    addComponentListener(
      'minimalHome.columnCount',
      (count: number) => {
        if (count > 0) {
          ;(this.$el as HTMLElement).style.setProperty(columnCountKey, count.toString())
        } else {
          ;(this.$el as HTMLElement).style.removeProperty(columnCountKey)
        }
      },
      true,
    )
  },
})
</script>
<style lang="scss">
@import 'common';

.minimal-home {
  --minimal-home-auto-card-column: 1;
  --card-width: 600px;
  --card-height: 122px;
  --minimal-home-grid-gap: 12px;
  --minimal-home-grid-padding: 8px;
  @media screen and (min-width: 1440px) {
    --minimal-home-auto-card-column: 2;
  }
  @media screen and (min-width: 2160px) {
    --minimal-home-auto-card-column: 3;
  }
  --minimal-home-card-column: var(
    --minimal-home-column-count-override,
    var(--minimal-home-auto-card-column)
  );

  padding: 24px 32px 0 32px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  &-tabs {
    flex-grow: 1;
    min-width: calc(
      var(--card-width) * var(--minimal-home-card-column) + var(--minimal-home-grid-gap) *
        (var(--minimal-home-card-column) - 1) + 2 * var(--minimal-home-grid-padding)
    );
    .minimal-home-tab {
      &-cards {
        display: grid;
        grid-template-columns: repeat(var(--minimal-home-card-column), var(--card-width));
        gap: var(--minimal-home-grid-gap);
        padding: 0 var(--minimal-home-grid-padding);
        margin-bottom: 16px;
        .video-card * {
          transition: 0.2s ease-out;
        }
      }
    }
  }
}
</style>
