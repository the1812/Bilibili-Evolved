import type { TabMapping } from '@/ui/tab-mapping'
import { TabOption, type DashboardHomeOptions } from '../options'
import type { ContentCardLayout } from '../shared/cards/content-card'
import { dashboardUrls, getSpaceUrls } from '../shared/urls'

type TabVisibilityOption = keyof DashboardHomeOptions & `${string}Show`
type TabLayoutOption = keyof DashboardHomeOptions & `${string}Layout`
type TabTrackCountOption = keyof DashboardHomeOptions & `${string}TrackCount`
export type DashboardTab = Pick<TabMapping, 'component' | 'propsData' | 'activeLink'> & {
  id: string
  name: TabOption
  visibilityOption: TabVisibilityOption
  layoutOption?: TabLayoutOption
  trackCountOption?: TabTrackCountOption
  fixedLayout?: ContentCardLayout
}

export const getDashboardTabs = (uid: string): DashboardTab[] => [
  {
    name: TabOption.Dynamic,
    id: 'dynamic',
    visibilityOption: 'dynamicShow',
    fixedLayout: 'compact',
    trackCountOption: 'dynamicTrackCount',
    component: () => import('./feeds/DynamicFeed.vue').then(m => m.default),
    activeLink: dashboardUrls.dynamics,
  },
  {
    name: TabOption.Video,
    id: 'video',
    visibilityOption: 'videoShow',
    layoutOption: 'videoLayout',
    trackCountOption: 'videoTrackCount',
    component: () => import('./feeds/VideoFeed.vue').then(m => m.default),
    activeLink: dashboardUrls.videoDynamics,
  },
  {
    name: TabOption.Bangumi,
    id: 'bangumi',
    visibilityOption: 'bangumiShow',
    layoutOption: 'bangumiLayout',
    trackCountOption: 'bangumiTrackCount',
    component: () => import('./feeds/DynamicFeed.vue').then(m => m.default),
    propsData: { feedType: 'pgc' },
    activeLink: dashboardUrls.bangumiDynamics,
  },
  {
    name: TabOption.Column,
    id: 'column',
    visibilityOption: 'columnShow',
    layoutOption: 'columnLayout',
    trackCountOption: 'columnTrackCount',
    component: () => import('./feeds/DynamicFeed.vue').then(m => m.default),
    propsData: { feedType: 'column' },
    activeLink: dashboardUrls.columnDynamics,
  },
  {
    name: TabOption.Search,
    id: 'search',
    visibilityOption: 'searchShow',
    component: () => import('./Search.vue').then(m => m.default),
  },
  {
    name: TabOption.Trending,
    id: 'trending',
    visibilityOption: 'trendingShow',
    layoutOption: 'trendingLayout',
    trackCountOption: 'trendingTrackCount',
    component: () => import('./feeds/Trending.vue').then(m => m.default),
    activeLink: dashboardUrls.popular,
  },
  {
    name: TabOption.Recommended,
    id: 'recommended',
    visibilityOption: 'recommendedShow',
    layoutOption: 'recommendedLayout',
    trackCountOption: 'recommendedTrackCount',
    component: () => import('./feeds/Trending.vue').then(m => m.default),
    propsData: { personalized: true },
  },
  {
    name: TabOption.Favorites,
    id: 'favorites',
    visibilityOption: 'favoritesShow',
    layoutOption: 'favoritesLayout',
    trackCountOption: 'favoritesTrackCount',
    component: () => import('./library/Favorites.vue').then(m => m.default),
    activeLink: uid ? getSpaceUrls(uid).favorites : undefined,
  },
  {
    name: TabOption.History,
    id: 'history',
    visibilityOption: 'historyShow',
    layoutOption: 'historyLayout',
    trackCountOption: 'historyTrackCount',
    component: () => import('./library/History.vue').then(m => m.default),
    activeLink: dashboardUrls.history,
  },
  {
    name: TabOption.Watchlater,
    id: 'watchlater',
    visibilityOption: 'watchlaterShow',
    layoutOption: 'watchlaterLayout',
    trackCountOption: 'watchlaterTrackCount',
    component: () => import('./library/Watchlater.vue').then(m => m.default),
    activeLink: dashboardUrls.watchlater,
  },
  {
    name: TabOption.Account,
    id: 'account',
    visibilityOption: 'accountShow',
    component: () => import('./account/Account.vue').then(m => m.default),
    activeLink: dashboardUrls.account,
  },
  {
    name: TabOption.Followings,
    id: 'followings',
    visibilityOption: 'followingsShow',
    layoutOption: 'followingsLayout',
    trackCountOption: 'followingsTrackCount',
    component: () => import('./followings/Followings.vue').then(m => m.default),
    activeLink: uid ? getSpaceUrls(uid).following : dashboardUrls.login,
  },
  {
    name: TabOption.Sitemap,
    id: 'sitemap',
    visibilityOption: 'sitemapShow',
    component: () => import('./sitemap/Sitemap.vue').then(m => m.default),
  },
]
