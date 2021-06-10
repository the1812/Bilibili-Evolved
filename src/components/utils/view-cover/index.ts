import { ComponentMetadata, componentsTags } from '@/components/component'
import { none } from '@/core/utils'
import { videoAndBangumiUrls } from '@/components/video/video-urls'
import { liveUrls } from '@/components/live/live-urls'

export const component: ComponentMetadata = {
  name: 'viewCover',
  displayName: '查看封面',
  tags: [
    componentsTags.utils,
    componentsTags.video,
    componentsTags.live,
  ],
  enabledByDefault: true,
  entry: none,
  widget: {
    component: () => import('./ViewCover.vue').then(m => m.default),
  },
  description: {
    'zh-CN': '在视频和直播页面中, 可从功能面板中查看封面.',
  },
  urlInclude: [
    ...videoAndBangumiUrls,
    ...liveUrls,
  ],
}
