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
  urlInclude: [/^https:\/\/space\.bilibili\.com\/\d+(?:[/?#]|$)/],
})
