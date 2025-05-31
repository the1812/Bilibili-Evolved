import { defineComponentMetadata } from '@/components/define'
import { liveUrls } from '@/core/utils/urls'

export const component = defineComponentMetadata({
  name: 'hide-fullscreen-gift-bar',
  displayName: '全屏直播礼物简化',
  description: '移除全屏观看直播时的底部礼物栏',
  author: {
    name: 'TimmyOVO',
    link: 'https://github.com/TimmyOVO',
  },
  instantStyles: [
    {
      name: 'hide-fullscreen-gift',
      style: () => import('./hide-full-screen-gift.css'),
    },
  ],
  entry: none,
  tags: [componentsTags.live, componentsTags.style],
  urlInclude: liveUrls,
})
