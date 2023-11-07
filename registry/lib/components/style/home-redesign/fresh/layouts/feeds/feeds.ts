import { defineAsyncComponent } from 'vue'
import type { FreshLayoutItem } from '../fresh-layout-item'

export const feeds: FreshLayoutItem = {
  name: 'feeds',
  displayName: '动态',
  grow: true,
  component: defineAsyncComponent(() => import('./Feeds.vue')),
}
