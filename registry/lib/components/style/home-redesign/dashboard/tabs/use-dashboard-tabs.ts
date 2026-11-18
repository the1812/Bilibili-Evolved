import { onBeforeUnmount, ref } from 'vue'
import { addComponentListener, removeComponentListener } from '@/core/settings'
import { getUID } from '@/core/utils'
import type { TabMapping } from '@/ui/tab-mapping'
import { DashboardHomeTabOption, type DashboardHomeOptions } from '../options'

type TabVisibilityOption = keyof DashboardHomeOptions & `show${string}`
export type DashboardTab = TabMapping & { visibilityOption: TabVisibilityOption }

export const useDashboardTabs = (dashboardHomeOptions: DashboardHomeOptions) => {
  const uid = getUID()
  const tabs: DashboardTab[] = [
    {
      name: DashboardHomeTabOption.Feeds,
      displayName: DashboardHomeTabOption.Feeds,
      visibilityOption: 'showFeeds',
      component: () => import('./video/VideoFeed.vue').then(m => m.default),
      activeLink: 'https://t.bilibili.com/?tab=video',
    },
    {
      name: DashboardHomeTabOption.Dynamic,
      displayName: DashboardHomeTabOption.Dynamic,
      visibilityOption: 'showDynamic',
      component: () => import('./dynamic/DynamicFeed.vue').then(m => m.default),
      activeLink: 'https://t.bilibili.com/',
    },
    {
      name: DashboardHomeTabOption.Followings,
      displayName: DashboardHomeTabOption.Followings,
      visibilityOption: 'showFollowings',
      component: () => import('./Followings.vue').then(m => m.default),
      activeLink: uid
        ? `https://space.bilibili.com/${uid}/fans/follow`
        : 'https://passport.bilibili.com/login',
    },
    {
      name: DashboardHomeTabOption.Trending,
      displayName: DashboardHomeTabOption.Trending,
      visibilityOption: 'showTrending',
      component: () => import('./video/Trending.vue').then(m => m.default),
      activeLink: 'https://www.bilibili.com/v/popular/all',
    },
    {
      name: DashboardHomeTabOption.Recommended,
      displayName: DashboardHomeTabOption.Recommended,
      visibilityOption: 'showRecommended',
      component: () => import('./video/Trending.vue').then(m => m.default),
      propsData: { personalized: true },
    },
    {
      name: DashboardHomeTabOption.Account,
      displayName: DashboardHomeTabOption.Account,
      visibilityOption: 'showAccount',
      component: () => import('./account/Account.vue').then(m => m.default),
      activeLink: 'https://account.bilibili.com/account/home',
    },
  ]

  const getVisibleTabs = () => tabs.filter(tab => dashboardHomeOptions[tab.visibilityOption])
  const visibleTabs = ref(getVisibleTabs())
  const getDefaultTab = () =>
    visibleTabs.value.find(tab => tab.name === dashboardHomeOptions.defaultTab) ??
    visibleTabs.value[0]
  const selectedTab = ref(getDefaultTab())

  const selectTab = (tab: DashboardTab) => {
    if (tab.name === selectedTab.value?.name && tab.activeLink) {
      window.open(tab.activeLink, '_blank', 'noopener')
    }
    selectedTab.value = tab
  }

  const updateVisibleTabs = () => {
    visibleTabs.value = getVisibleTabs()
    if (!visibleTabs.value.includes(selectedTab.value)) {
      selectedTab.value = getDefaultTab()
    }
  }

  for (const { visibilityOption } of tabs) {
    addComponentListener(`dashboardHome.${visibilityOption}`, updateVisibleTabs)
  }
  onBeforeUnmount(() => {
    for (const { visibilityOption } of tabs) {
      removeComponentListener(`dashboardHome.${visibilityOption}`, updateVisibleTabs)
    }
  })

  return { visibleTabs, selectedTab, selectTab }
}
