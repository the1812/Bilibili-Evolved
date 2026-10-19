import { defineOptionsMetadata, OptionsOfMetadata } from '@/components/define'
import { getComponentSettings } from '@/core/settings'

/** 组件名称, 同时用于设置项路径 */
export const COMPONENT_NAME = 'filterByTag'

/** 可在首页屏蔽的卡片分类 */
export interface BlockCategory {
  /** 存进设置里的 id */
  id: string
  /** 面板上显示的名字 */
  displayName: string
}

export const BLOCK_CATEGORIES: BlockCategory[] = [
  { id: 'live', displayName: '直播' },
  { id: 'cheese', displayName: '课堂' },
  { id: 'bangumi', displayName: '番剧' },
  { id: 'cinema', displayName: '影视' },
  { id: 'variety', displayName: '综艺' },
  { id: 'documentary', displayName: '纪录片' },
  { id: 'manga', displayName: '漫画' },
  { id: 'column', displayName: '专栏' },
  { id: 'activity', displayName: '活动/赛事' },
  { id: 'ad', displayName: '广告' },
]

export const options = defineOptionsMetadata({
  blockedTags: {
    displayName: '屏蔽的标签',
    // 用 `/正则/` 形式书写时按正则匹配, 其余按「包含」匹配
    defaultValue: [] as string[],
    // 由 Settings.vue 接管 UI
    hidden: true,
  },
  blockedTypes: {
    displayName: '屏蔽的分类',
    // 值为 BLOCK_CATEGORIES 里的 id, 仅在首页生效
    defaultValue: [] as string[],
    hidden: true,
  },
  whitelist: {
    displayName: 'UP 主白名单',
    // 白名单内的 UP 主开启直播时, 直播卡片不会被屏蔽
    defaultValue: [] as string[],
    hidden: true,
  },
})

export type FilterByTagOptions = OptionsOfMetadata<typeof options>

export const getFilterOptions = () =>
  getComponentSettings<FilterByTagOptions>(COMPONENT_NAME).options

const toStringArray = (value: unknown) =>
  Array.isArray(value) ? value.filter((it): it is string => typeof it === 'string') : []

export const getBlockedTags = () => toStringArray(getFilterOptions().blockedTags)

export const getBlockedTypes = () => toStringArray(getFilterOptions().blockedTypes)

export const getWhitelist = () => toStringArray(getFilterOptions().whitelist)
