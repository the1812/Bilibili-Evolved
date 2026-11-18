<template>
  <HomeRedesignBase>
    <div class="dashboard-home">
      <TabControl class="dashboard-home-tabs" :default-tab="defaultTab" :tabs="tabs" />
    </div>
  </HomeRedesignBase>
</template>
<script lang="ts">
import { addComponentListener } from '@/core/settings'
import { TabControl } from '@/ui'
import { TabMappings } from '@/ui/tab-mapping'
import HomeRedesignBase from '../HomeRedesignBase.vue'
import { dashboardHomeOptions } from './options'
import { DashboardHomeTabOption } from './types'

const tabs: TabMappings = [
  {
    name: DashboardHomeTabOption.Feeds,
    displayName: '动态',
    component: () => import('./tabs/Feeds.vue').then(m => m.default),
    activeLink: 'https://t.bilibili.com/?tab=video',
  },
  {
    name: DashboardHomeTabOption.Trending,
    displayName: dashboardHomeOptions.personalized ? '推荐' : '热门',
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
      defaultTab: dashboardHomeOptions.defaultTab,
    }
  },
  mounted() {
    const columnCountKey = '--dashboard-home-column-count-override'
    addComponentListener(
      'dashboardHome.columnCount',
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
