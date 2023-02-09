import { defineAsyncComponent } from 'vue'
import type { FreshLayoutItem } from '../fresh-layout-item'

export const trending: FreshLayoutItem = {
  name: 'trending',
  displayName: '热门视频',
  grow: true,
  component: defineAsyncComponent(() => import('./Trending.vue')),
}
