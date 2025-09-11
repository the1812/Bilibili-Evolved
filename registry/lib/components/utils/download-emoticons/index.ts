import { defineComponentMetadata } from '@/components/define'
import { liveUrls } from '@/core/utils/urls'

export const component = defineComponentMetadata({
  name: 'downloadEmoticons',
  displayName: '下载表情',
  tags: [componentsTags.utils, componentsTags.live],
  entry: none,
  author: {
    name: 'Pencilqaq',
    link: 'https://github.com/pencilqaq',
  },
  widget: {
    component: () => import('./Widget.vue').then(m => m.default),
  },
  urlInclude: liveUrls,
})
