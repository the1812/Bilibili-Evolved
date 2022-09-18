import { defineComponentMetadata } from '@/components/define'
import { videoAndBangumiUrls } from '@/core/utils/urls'

export const component = defineComponentMetadata({
  name: 'viewCover',
  displayName: '查看封面',
  tags: [
    componentsTags.utils,
    componentsTags.video,
    // componentsTags.live,
  ],
  entry: none,
  reload: none,
  unload: none,
  widget: {
    component: () => import('./ViewCover.vue').then(m => m.default),
  },
  description: {
    'zh-CN': '在视频页面中, 可从功能面板中查看封面.',
  },
  urlInclude: [
    ...videoAndBangumiUrls,
    // ...liveUrls,
  ],
})
