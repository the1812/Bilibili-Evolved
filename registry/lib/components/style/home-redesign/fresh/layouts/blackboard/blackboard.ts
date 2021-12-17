import { FreshLayoutItem } from '../fresh-layout-item'

export const blackboard: FreshLayoutItem = {
  name: 'blackboard',
  displayName: '活动',
  component: () => import('./Blackboard.vue').then(m => m.default),
}
