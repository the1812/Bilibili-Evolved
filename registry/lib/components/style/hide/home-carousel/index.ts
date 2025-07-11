import { wrapSwitchOptions } from '@/components/switch-options'

export const component = wrapSwitchOptions({
  name: 'hideHomeCarouselOptions',
  switches: {
    full: {
      displayName: '隐藏轮播区域占位',
      defaultValue: true,
    },
    transparent: {
      displayName: '透明化轮播区域',
      defaultValue: false,
    },
    picture: {
      displayName: '隐藏轮播图片',
      defaultValue: false,
    },
    footerText: {
      displayName: '隐藏图片标题',
      defaultValue: false,
    },
  },
})({
  name: 'hideHomeCarousel',
  displayName: '隐藏首页轮播图',
  entry: null,
  tags: [componentsTags.style],
  urlInclude: [/^https:\/\/www\.bilibili\.com\/$/, /^https:\/\/www\.bilibili\.com\/index\.html$/],
  instantStyles: [
    {
      name: 'hide-home-carousel',
      style: () => import('./hide-home-carousel.scss'),
    },
  ],
})
