import { defineComponentMetadata } from '@/components/define'

export const component = defineComponentMetadata({
  name: 'changeUpdateUrls',
  displayName: '更新链接替换',
  entry: none,
  tags: [componentsTags.utils],
  widget: {
    component: () => import('./Widget.vue').then(m => m.default),
  },
})
