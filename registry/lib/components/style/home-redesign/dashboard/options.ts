import { onBeforeUnmount, shallowRef } from 'vue'
import { defineOptionsMetadata, type OptionsOfMetadata } from '@/components/define'
import {
  addComponentListener,
  getComponentSettings,
  removeComponentListener,
} from '@/core/settings'
import { getNumberValidator } from '@/core/utils'

export enum DashboardHomeTabOption {
  Video = '视频',
  Bangumi = '番剧',
  Article = '专栏',
  Dynamic = '动态',
  Followings = '关注',
  Trending = '热门',
  Recommended = '推荐',
  Search = '搜索',
  Favorites = '收藏',
  History = '历史',
  Watchlater = '稍后再看',
  Account = '我的',
  Sitemap = '站点',
}

export const dashboardHomeOptionsMetadata = defineOptionsMetadata({
  showVideo: {
    displayName: '显示「视频」',
    defaultValue: true,
  },
  showBangumi: {
    displayName: '显示「番剧」',
    defaultValue: true,
  },
  showArticle: {
    displayName: '显示「专栏」',
    defaultValue: true,
  },
  showDynamic: {
    displayName: '显示「动态」',
    defaultValue: true,
  },
  showFollowings: {
    displayName: '显示「关注」',
    defaultValue: true,
  },
  showTrending: {
    displayName: '显示「热门」',
    defaultValue: true,
  },
  showRecommended: {
    displayName: '显示「推荐」',
    defaultValue: true,
  },
  showSearch: {
    displayName: '显示「搜索」',
    defaultValue: true,
  },
  showFavorites: {
    displayName: '显示「收藏」',
    defaultValue: true,
  },
  showHistory: {
    displayName: '显示「历史」',
    defaultValue: true,
  },
  showWatchlater: {
    displayName: '显示「稍后再看」',
    defaultValue: true,
  },
  showAccount: {
    displayName: '显示「我的」',
    defaultValue: true,
  },
  showSitemap: {
    displayName: '显示「站点」',
    defaultValue: true,
  },
  columnCount: {
    displayName: '自定义列数',
    defaultValue: 0,
    validator: getNumberValidator(0, 10),
  },
  defaultTab: {
    displayName: '默认标签页',
    defaultValue: DashboardHomeTabOption.Video,
    dropdownEnum: DashboardHomeTabOption,
  },
})

export type DashboardHomeOptions = OptionsOfMetadata<typeof dashboardHomeOptionsMetadata>
export const getDashboardHomeOptions = () =>
  getComponentSettings<DashboardHomeOptions>('dashboardHome').options

export const useDashboardOption = <K extends keyof DashboardHomeOptions>(name: K) => {
  const value = shallowRef(getDashboardHomeOptions()[name])
  const path = `dashboardHome.${name}`
  const update = (nextValue: DashboardHomeOptions[K]) => {
    value.value = nextValue
  }
  addComponentListener(path, update)
  onBeforeUnmount(() => removeComponentListener(path, update))
  return value
}
