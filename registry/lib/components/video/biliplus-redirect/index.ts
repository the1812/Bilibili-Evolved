import { defineComponentMetadata } from '@/components/define'
import { videoAndBangumiUrls } from '@/core/utils/urls'

export const component = defineComponentMetadata({
  name: 'biliplusRedirect',
  displayName: 'BiliPlus 跳转支持',
  description: {
    'zh-CN': '在视频 / 番剧 / 空间中, 可以从功能中的按钮点击转到 BiliPlus 上对应的页面.',
  },
  urlInclude: [...videoAndBangumiUrls, '//space.bilibili.com'],
  entry: none,
  tags: [componentsTags.video, componentsTags.utils],
  widget: {
    component: () => import('./BiliplusRedirect.vue').then(m => m.default),
  },
})
