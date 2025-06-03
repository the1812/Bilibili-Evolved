import { defineComponentMetadata } from '@/components/define'

export const component = defineComponentMetadata({
  name: 'hideHomeCarousel',
  displayName: '隐藏首页轮播图',
  entry: none,
  tags: [componentsTags.style],
  urlInclude: [/^https:\/\/www\.bilibili\.com\/$/, /^https:\/\/www\.bilibili\.com\/index\.html$/],
  instantStyles: [
    {
      name: 'hide-home-carousel',
      style: () => import('./hide-home-carousel.scss'),
    },
  ],
})
