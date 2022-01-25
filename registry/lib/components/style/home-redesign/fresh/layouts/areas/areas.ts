import { FreshLayoutItem } from '../fresh-layout-item'

export const areas: FreshLayoutItem = {
  name: 'areas',
  displayName: '栏目',
  component: () => import('./Areas.vue').then(m => m.default),
}
