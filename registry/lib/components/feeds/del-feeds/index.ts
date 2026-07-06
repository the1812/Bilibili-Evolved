import { defineComponentMetadata } from '@/components/define'
import { getUID } from '@/core/utils'

export const component = defineComponentMetadata({
  name: 'deleteFeeds',
  displayName: '删除动态',
  tags: [componentsTags.feeds],
  entry: none,
  urlInclude: [`https://space.bilibili.com/${getUID()}/dynamic`],
  widget: {
    component: () => import('./Widget.vue').then(m => m.default),
  },
})
