import { onBeforeUnmount, shallowRef } from 'vue'
import { defineOptionsMetadata, type OptionsOfMetadata } from '@/components/define'
import {
  addComponentListener,
  getComponentSettings,
  removeComponentListener,
} from '@/core/settings'
import { getNumberValidator } from '@/core/utils'

export enum DashboardHomeTabOption {
  Feeds = '视频',
  Dynamic = '动态',
  Followings = '关注',
  Trending = '热门',
  Recommended = '推荐',
  Account = '我的',
}

export const dashboardHomeOptionsMetadata = defineOptionsMetadata({
  showFeeds: {
    displayName: '显示「视频」',
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
  showAccount: {
    displayName: '显示「我的」',
    defaultValue: true,
  },
  enableWatchlater: {
    displayName: '启用「稍后再看」',
    defaultValue: true,
  },
  columnCount: {
    displayName: '自定义列数',
    defaultValue: 0,
    validator: getNumberValidator(0, 10),
  },
  defaultTab: {
    displayName: '默认标签页',
    defaultValue: DashboardHomeTabOption.Feeds,
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
