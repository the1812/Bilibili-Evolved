import { FreshLayoutItem } from '../fresh-layout-item'

export const trending: FreshLayoutItem = {
  name: 'trending',
  displayName: '热门视频',
  grow: true,
  component: () => import('./Trending.vue').then(m => m.default),
}
