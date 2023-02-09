import { defineAsyncComponent } from 'vue'
import type { Category } from '@/components/utils/categories/data'

import type { FreshLayoutItem } from '../fresh-layout-item'

export interface TabType {
  id: number
  name: string
  displayName: string
  category: Category
  href: string
  order: number
}

export const categories: FreshLayoutItem = {
  name: 'categories',
  displayName: '分区',
  grow: true,
  component: defineAsyncComponent(() => import('./Categories.vue')),
}
