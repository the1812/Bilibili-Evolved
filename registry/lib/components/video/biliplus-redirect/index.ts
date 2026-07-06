import { defineComponentMetadata } from '@/components/define'
import { videoAndBangumiUrls } from '@/core/utils/urls'

export const component = defineComponentMetadata({
  name: 'biliplusRedirect',
  displayName: 'BiliPlus 跳转支持',
  urlInclude: [...videoAndBangumiUrls, '//space.bilibili.com'],
  entry: none,
  tags: [componentsTags.video, componentsTags.utils],
  widget: {
    component: () => import('./BiliplusRedirect.vue').then(m => m.default),
  },
})
