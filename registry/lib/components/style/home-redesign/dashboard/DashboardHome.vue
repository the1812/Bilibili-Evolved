<template>
  <HomeRedesignBase>
    <div
      class="dashboard-home"
      :style="{ '--dashboard-home-column-count-override': columnCount > 0 ? columnCount : null }"
    >
      <TabControl
        v-if="visibleTabs.length"
        :key="tabControlVersion"
        class="dashboard-home-tabs"
        :default-tab="dashboardHomeOptions.defaultTab"
        :tabs="visibleTabs"
        @change="rememberSelectedLink"
      />
      <VEmpty v-else>请在仪表盘首页设置中开启标签页</VEmpty>
    </div>
  </HomeRedesignBase>
</template>
<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { addComponentListener, removeComponentListener } from '@/core/settings'
import { getUID } from '@/core/utils'
import { TabControl, VEmpty } from '@/ui'
import type { TabMapping } from '@/ui/tab-mapping'
import HomeRedesignBase from '../HomeRedesignBase.vue'
import { dashboardHomeOptions } from './options'
import { DashboardHomeTabOption } from './types'

type TabVisibilityOption = Exclude<keyof typeof dashboardHomeOptions, 'columnCount' | 'defaultTab'>
const uid = getUID()
const tabs: (TabMapping & { visibilityOption: TabVisibilityOption })[] = [
  {
    name: DashboardHomeTabOption.Feeds,
    displayName: DashboardHomeTabOption.Feeds,
    visibilityOption: 'showFeeds',
    component: () => import('./tabs/Feeds.vue').then(m => m.default),
    activeLink: 'https://t.bilibili.com/?tab=video',
  },
  {
    name: DashboardHomeTabOption.Dynamic,
    displayName: DashboardHomeTabOption.Dynamic,
    visibilityOption: 'showDynamic',
    component: () => import('./tabs/DynamicFeed.vue').then(m => m.default),
    activeLink: 'https://t.bilibili.com/',
  },
  {
    name: DashboardHomeTabOption.Followings,
    displayName: DashboardHomeTabOption.Followings,
    visibilityOption: 'showFollowings',
    component: () => import('./tabs/Followings.vue').then(m => m.default),
    activeLink: uid
      ? `https://space.bilibili.com/${uid}/fans/follow`
      : 'https://passport.bilibili.com/login',
  },
  {
    name: DashboardHomeTabOption.Trending,
    displayName: DashboardHomeTabOption.Trending,
    visibilityOption: 'showTrending',
    component: () => import('./tabs/Trending.vue').then(m => m.default),
    activeLink: 'https://www.bilibili.com/v/popular/all',
  },
  {
    name: DashboardHomeTabOption.Recommended,
    displayName: DashboardHomeTabOption.Recommended,
    visibilityOption: 'showRecommended',
    component: () => import('./tabs/Trending.vue').then(m => m.default),
    propsData: { personalized: true },
  },
]

const getVisibleTabs = () => tabs.filter(tab => dashboardHomeOptions[tab.visibilityOption])
const visibleTabs = ref(getVisibleTabs())
const tabControlVersion = ref(0)
let selectedLink: string | null | undefined = null
const rememberSelectedLink = (link?: string) => {
  selectedLink = link
}
const updateVisibleTabs = () => {
  visibleTabs.value = getVisibleTabs()
  if (!visibleTabs.value.some(tab => tab.activeLink === selectedLink)) {
    tabControlVersion.value += 1
  }
}

const columnCount = ref(dashboardHomeOptions.columnCount)
const updateColumnCount = (value: number) => {
  columnCount.value = value
}
addComponentListener('dashboardHome.columnCount', updateColumnCount)
for (const { visibilityOption } of tabs) {
  addComponentListener(`dashboardHome.${visibilityOption}`, updateVisibleTabs)
}
onBeforeUnmount(() => {
  removeComponentListener('dashboardHome.columnCount', updateColumnCount)
  for (const { visibilityOption } of tabs) {
    removeComponentListener(`dashboardHome.${visibilityOption}`, updateVisibleTabs)
  }
})
</script>
