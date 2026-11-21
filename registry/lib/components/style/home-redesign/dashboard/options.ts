import { onBeforeUnmount, shallowRef } from 'vue'
import { defineOptionsMetadata, type OptionsOfMetadata } from '@/components/define'
import {
  addComponentListener,
  getComponentSettings,
  metadataToOptions,
  removeComponentListener,
} from '@/core/settings'
import { getNumberValidator } from '@/core/utils'
import type { LinkType } from './shared/urls'

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

export const dashboardRememberTabLabel = {
  prefix: '在网址中',
  keyword: '记住当前标签页',
}

export const dashboardLinkPreviewLabelPrefix = '在首页内打开'
export const dashboardLinkPreviewLabels = {
  openLiveLinksInPlace: '直播链接',
  openSpaceLinksInPlace: '个人空间链接',
  openDynamicLinksInPlace: '动态链接',
  openVideoLinksInPlace: '视频链接',
  openColumnLinksInPlace: '专栏链接',
  openBilibiliLinksInPlace: '其他 B 站链接',
  openExternalLinksInPlace: '外部链接',
}

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
    displayName: dashboardRememberTabLabel.prefix + dashboardRememberTabLabel.keyword,
    defaultValue: false,
  },

  ...lodash.mapValues(dashboardLinkPreviewLabels, label => ({
    displayName: dashboardLinkPreviewLabelPrefix + label,
    defaultValue: false,
  })),
})

export type DashboardHomeOptions = OptionsOfMetadata<typeof dashboardHomeOptionsMetadata>

type LinkPreviewOption = keyof DashboardHomeOptions & `open${string}LinksInPlace`

export const dashboardLinkPreviewOptions: Partial<Record<LinkType, LinkPreviewOption>> = {
  live: 'openLiveLinksInPlace',
  space: 'openSpaceLinksInPlace',
  dynamic: 'openDynamicLinksInPlace',
  video: 'openVideoLinksInPlace',
  column: 'openColumnLinksInPlace',
  bilibili: 'openBilibiliLinksInPlace',
  external: 'openExternalLinksInPlace',
}

export const getDashboardHomeOptions = () =>
  getComponentSettings<DashboardHomeOptions>('dashboardHome').options

export const setDashboardOption = <K extends keyof DashboardHomeOptions>(
  name: K,
  value: DashboardHomeOptions[K],
) => {
  getDashboardHomeOptions()[name] = value
}

export const resetDashboardOptions = () => {
  const options = getDashboardHomeOptions()
  const defaults = metadataToOptions<DashboardHomeOptions>(dashboardHomeOptionsMetadata)
  for (const name of Object.keys(defaults) as (keyof DashboardHomeOptions)[]) {
    const value = defaults[name]
    if (!lodash.isEqual(options[name], value)) {
      setDashboardOption(name, lodash.cloneDeep(value))
    }
  }
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
