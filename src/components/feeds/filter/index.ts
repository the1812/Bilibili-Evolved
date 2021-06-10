import { ComponentMetadata, componentsTags, ComponentOptions } from '@/components/component'

const entry = async () => {
  const { select } = await import('@/core/spin-query')
  const leftPanel = await select('.home-container .left-panel')
  if (leftPanel === null) {
    return
  }
  const FeedsFilterCard = await import('./FeedsFilterCard.vue')
  const { mountVueComponent } = await import('@/core/utils')
  leftPanel.insertAdjacentElement('afterbegin', mountVueComponent(FeedsFilterCard).$el)
}
const options: ComponentOptions = {
  types: {
    defaultValue: [],
    displayName: '过滤动态类型',
    hidden: true,
  },
  patterns: {
    defaultValue: [],
    displayName: '过滤关键词',
    hidden: true,
  },
  sideCards: {
    defaultValue: [],
    displayName: '过滤侧边栏',
    hidden: true,
  },
  specialTypes: {
    defaultValue: [],
    displayName: '过滤特殊动态类型',
    hidden: true,
  },
}
export type FeedsFilterOptions = {
  types: number[]
  patterns: string[]
  /** 虽然代码里按照`number[]`, 但其实存进去的是`string[]`, 不过问题不大( */
  sideCards: number[]
  specialTypes: number[]
}
export const component: ComponentMetadata = {
  name: 'feedsFilter',
  displayName: '动态过滤器',
  description: {
    'zh-CN': '按照类型或者关键词过滤动态首页的内容, 也可以移除动态页的一些侧边卡片.',
  },
  entry,
  enabledByDefault: false,
  tags: [
    componentsTags.feeds,
  ],
  options,
  reload: () => document.body.classList.remove('disable-feeds-filter'),
  unload: () => document.body.classList.add('disable-feeds-filter'),
  urlInclude: [
    /^https:\/\/t\.bilibili\.com\/$/,
  ],
}
