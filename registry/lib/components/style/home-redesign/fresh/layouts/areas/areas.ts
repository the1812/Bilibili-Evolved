import { defineAsyncComponent } from 'vue'
import type { FreshLayoutItem } from '../fresh-layout-item'

export const areas: FreshLayoutItem = {
  name: 'areas',
  displayName: '栏目',
  component: defineAsyncComponent(() => import('./Areas.vue')),
}
