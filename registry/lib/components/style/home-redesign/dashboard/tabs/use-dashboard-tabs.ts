import { onBeforeUnmount, ref } from 'vue'
import { addComponentListener, removeComponentListener } from '@/core/settings'
import { getUID } from '@/core/utils'
import type { TabMapping } from '@/ui/tab-mapping'
import { DashboardHomeTabOption, type DashboardHomeOptions } from '../options'

type TabVisibilityOption = keyof DashboardHomeOptions & `show${string}`

export const useDashboardTabs = (dashboardHomeOptions: DashboardHomeOptions) => {
  const uid = getUID()
  const tabs: (TabMapping & { visibilityOption: TabVisibilityOption })[] = [
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

  for (const { visibilityOption } of tabs) {
    addComponentListener(`dashboardHome.${visibilityOption}`, updateVisibleTabs)
  }
  onBeforeUnmount(() => {
    for (const { visibilityOption } of tabs) {
      removeComponentListener(`dashboardHome.${visibilityOption}`, updateVisibleTabs)
    }
  })

  return { visibleTabs, tabControlVersion, rememberSelectedLink }
}
