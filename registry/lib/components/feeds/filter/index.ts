import {
  defineComponentMetadata,
  defineOptionsMetadata,
  OptionsOfMetadata,
} from '@/components/define'
import { feedsFilterPlugin } from './plugin'

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
const options = defineOptionsMetadata({
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
})
export type Options = OptionsOfMetadata<typeof options>
export const component = defineComponentMetadata({
  name: 'feedsFilter',
  displayName: '动态过滤器',
  description: {
    'zh-CN': '按照类型或者关键词过滤动态首页的内容, 也可以移除动态页的一些侧边卡片.',
  },
  entry,
  tags: [
    componentsTags.feeds,
  ],
  options,
  reload: () => document.body.classList.remove('disable-feeds-filter'),
  unload: () => document.body.classList.add('disable-feeds-filter'),
  urlInclude: [
    // 仅动态首页
    /^https:\/\/t\.bilibili\.com\/$/,
  ],
  plugin: feedsFilterPlugin,
})
