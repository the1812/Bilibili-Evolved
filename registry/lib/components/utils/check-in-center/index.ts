import { defineComponentMetadata } from '@/components/define'
import { getUID } from '@/core/utils'
import { checkInOptions } from './options'

export const component = defineComponentMetadata({
  name: 'checkInCenter',
  displayName: '签到助手',
  tags: [componentsTags.utils],
  options: checkInOptions,
  entry: none,
  widget: {
    component: () => import('./Widget.vue').then(m => m.default),
    condition: () => Boolean(getUID()),
  },
})
