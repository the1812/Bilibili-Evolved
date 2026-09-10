import { defineComponentMetadata } from '@/components/define'

export const component = defineComponentMetadata({
  name: 'hideHomeChannel',
  displayName: '隐藏首页频道栏',
  entry: none,
  instantStyles: [
    {
      name: 'hideHomeChannel',
      style: () => import('./home-channel.scss'),
    },
  ],
  urlInclude: [/^https:\/\/www\.bilibili\.com\/(?:index\.html)?(?:[?#].*)?$/],
  tags: [componentsTags.style],
  author: {
    name: 'ChiyukiKazama',
    link: 'https://github.com/ChiyukiKazama',
  },
})
