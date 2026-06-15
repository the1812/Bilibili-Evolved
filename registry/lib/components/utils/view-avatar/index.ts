import { defineComponentMetadata } from '@/components/define'

export const component = defineComponentMetadata({
  name: 'viewAvatar',
  displayName: '查看头像',
  author: {
    name: 'Chains.Z',
    link: 'https://github.com/Chains-Z',
  },
  tags: [componentsTags.utils],
  entry: none,
  reload: none,
  unload: none,
  widget: {
    component: () => import('./ViewAvatar.vue').then(m => m.default),
  },
  description: {
    'zh-CN': '在个人空间页面中, 可从功能面板中查看当前用户的高分辨率头像.',
  },
  urlInclude: [/^https:\/\/space\.bilibili\.com\/\d+(?:[/?#]|$)/],
})
