import { onBeforeUnmount, shallowRef } from 'vue'
import { defineOptionsMetadata, type OptionsOfMetadata } from '@/components/define'
import {
  addComponentListener,
  getComponentSettings,
  removeComponentListener,
} from '@/core/settings'
import { getNumberValidator } from '@/core/utils'

export enum TabOption {
  Dynamic = '动态',
  Video = '视频',
  Bangumi = '番剧',
  Column = '专栏',
  Search = '搜索',
  Trending = '热门',
  Recommended = '推荐',
  Favorites = '收藏',
  History = '历史',
  Watchlater = '稍后再看',
  Account = '我的',
  Followings = '关注',
  Sitemap = '站点',
  Settings = '设置',
}

export enum LayoutOption {
  Horizontal = '横向',
  Compact = '紧凑',
  Vertical = '纵向',
}

const tabOption = (tab: TabOption, defaultValue: boolean) => ({
  displayName: `显示「${tab}」`,
  defaultValue,
})

const layoutOption = (tab: TabOption, defaultValue: LayoutOption) => ({
  displayName: `「${tab}」卡片布局`,
  defaultValue,
  dropdownEnum: LayoutOption,
})

const dateGroupingOption = (tab: TabOption, defaultValue: boolean) => ({
  displayName: `「${tab}」按日期分组`,
  defaultValue,
})

export const maxTrackCount = 8
const clampTrackCount = getNumberValidator(0, maxTrackCount)
export const validateTrackCount = (value: number, oldValue: number) => {
  const count = Math.round(value)
  return Number.isFinite(count) ? clampTrackCount(count, oldValue) : oldValue
}
const trackCountOption = (tab: TabOption, defaultValue: number) => ({
  displayName: `「${tab}」卡片行列数`,
  defaultValue,
  validator: validateTrackCount,
})

export const dashboardHomeOptionsMetadata = defineOptionsMetadata({
  dynamicShow: tabOption(TabOption.Dynamic, true),
  dynamicTrackCount: trackCountOption(TabOption.Dynamic, 0),
  dynamicGroupByDate: dateGroupingOption(TabOption.Dynamic, false),

  videoShow: tabOption(TabOption.Video, true),
  videoLayout: layoutOption(TabOption.Video, LayoutOption.Horizontal),
  videoTrackCount: trackCountOption(TabOption.Video, 0),
  videoGroupByDate: dateGroupingOption(TabOption.Video, true),

  bangumiShow: tabOption(TabOption.Bangumi, true),
  bangumiLayout: layoutOption(TabOption.Bangumi, LayoutOption.Compact),
  bangumiTrackCount: trackCountOption(TabOption.Bangumi, 0),
  bangumiGroupByDate: dateGroupingOption(TabOption.Bangumi, true),

  columnShow: tabOption(TabOption.Column, true),
  columnLayout: layoutOption(TabOption.Column, LayoutOption.Compact),
  columnTrackCount: trackCountOption(TabOption.Column, 0),
  columnGroupByDate: dateGroupingOption(TabOption.Column, true),

  searchShow: tabOption(TabOption.Search, true),

  trendingShow: tabOption(TabOption.Trending, true),
  trendingLayout: layoutOption(TabOption.Trending, LayoutOption.Horizontal),
  trendingTrackCount: trackCountOption(TabOption.Trending, 0),

  recommendedShow: tabOption(TabOption.Recommended, true),
  recommendedLayout: layoutOption(TabOption.Recommended, LayoutOption.Horizontal),
  recommendedTrackCount: trackCountOption(TabOption.Recommended, 0),

  favoritesShow: tabOption(TabOption.Favorites, true),
  favoritesLayout: layoutOption(TabOption.Favorites, LayoutOption.Compact),
  favoritesTrackCount: trackCountOption(TabOption.Favorites, 0),
  favoritesGroupByDate: dateGroupingOption(TabOption.Favorites, true),

  historyShow: tabOption(TabOption.History, true),
  historyLayout: layoutOption(TabOption.History, LayoutOption.Compact),
  historyTrackCount: trackCountOption(TabOption.History, 0),
  historyGroupByDate: dateGroupingOption(TabOption.History, true),

  watchlaterShow: tabOption(TabOption.Watchlater, true),
  watchlaterLayout: layoutOption(TabOption.Watchlater, LayoutOption.Compact),
  watchlaterTrackCount: trackCountOption(TabOption.Watchlater, 0),
  watchlaterGroupByDate: dateGroupingOption(TabOption.Watchlater, false),

  accountShow: tabOption(TabOption.Account, true),

  followingsShow: tabOption(TabOption.Followings, true),
  followingsLayout: layoutOption(TabOption.Followings, LayoutOption.Compact),
  followingsTrackCount: trackCountOption(TabOption.Followings, 0),
  followingsGroupByDate: dateGroupingOption(TabOption.Followings, false),

  sitemapShow: tabOption(TabOption.Sitemap, true),
  settingsShow: tabOption(TabOption.Settings, true),

  tabOrder: { defaultValue: [] as string[], hidden: true },
  hiddenPluginTabs: { defaultValue: [] as string[], hidden: true },

  defaultTab: {
    displayName: '默认标签页',
    defaultValue: TabOption.Video,
    dropdownEnum: TabOption,
  },
  rememberTabInUrl: {
    displayName: '在网址中记住当前标签页',
    defaultValue: false,
  },

  openLiveLinksInPlace: {
    displayName: '在首页内打开直播链接',
    defaultValue: false,
  },
  openSpaceLinksInPlace: {
    displayName: '在首页内打开个人空间链接',
    defaultValue: false,
  },
  openDynamicLinksInPlace: {
    displayName: '在首页内打开动态链接',
    defaultValue: false,
  },
  openVideoLinksInPlace: {
    displayName: '在首页内打开视频链接',
    defaultValue: false,
  },
  openColumnLinksInPlace: {
    displayName: '在首页内打开专栏链接',
    defaultValue: false,
  },
  openBilibiliLinksInPlace: {
    displayName: '在首页内打开其他 B 站链接',
    defaultValue: false,
  },
  openExternalLinksInPlace: {
    displayName: '在首页内打开外部链接',
    defaultValue: false,
  },
})

export type DashboardHomeOptions = OptionsOfMetadata<typeof dashboardHomeOptionsMetadata>
export const getDashboardHomeOptions = () =>
  getComponentSettings<DashboardHomeOptions>('dashboardHome').options

export const setDashboardOption = <K extends keyof DashboardHomeOptions>(
  name: K,
  value: DashboardHomeOptions[K],
) => {
  getDashboardHomeOptions()[name] = value
}

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
