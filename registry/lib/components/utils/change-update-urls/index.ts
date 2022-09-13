import { defineComponentMetadata } from '@/components/define'

export const component = defineComponentMetadata({
  name: 'changeUpdateUrls',
  displayName: '更新链接替换',
  description: '批量更换已安装功能的更新链接的分支, 对本地安装的功能无效.',
  entry: none,
  tags: [componentsTags.utils],
  widget: {
    component: () => import('./Widget.vue').then(m => m.default),
  },
})
