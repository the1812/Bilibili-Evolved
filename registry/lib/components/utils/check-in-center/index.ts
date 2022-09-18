import { defineComponentMetadata } from '@/components/define'
import { getUID } from '@/core/utils'

export const component = defineComponentMetadata({
  name: 'checkInCenter',
  displayName: '签到助手',
  description: {
    'zh-CN': '在功能面板中提供一些可以每日进行的操作.',
  },
  tags: [componentsTags.utils],
  entry: none,
  widget: {
    component: () => import('./Widget.vue').then(m => m.default),
    condition: () => Boolean(getUID()),
  },
})
