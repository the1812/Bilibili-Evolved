import { defineComponentMetadata } from '@/components/define'
import { getUID } from '@/core/utils'

export const component = defineComponentMetadata({
  name: 'deleteFeeds',
  displayName: '删除动态',
  tags: [componentsTags.feeds],
  description: {
    'zh-CN': `删除动态, 可选转发抽奖(不会删除自己中奖的动态), 和全部删除.`,
  },
  entry: none,
  urlInclude: [`https://space.bilibili.com/${getUID()}/dynamic`],
  widget: {
    component: () => import('./Widget.vue').then(m => m.default),
  },
})
