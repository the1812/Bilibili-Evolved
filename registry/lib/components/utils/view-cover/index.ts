import { ComponentMetadata } from '@/components/types'
import { hasVideo } from '@/core/spin-query'
import { videoAndBangumiUrls, liveUrls } from '@/core/utils/urls'

export const component: ComponentMetadata = {
  name: 'viewCover',
  displayName: '查看封面',
  tags: [
    componentsTags.utils,
    componentsTags.video,
    componentsTags.live,
  ],
  entry: none,
  reload: none,
  unload: none,
  widget: {
    component: () => import('./ViewCover.vue').then(m => m.default),
    condition: hasVideo,
  },
  description: {
    'zh-CN': '在视频和直播页面中, 可从功能面板中查看封面.',
  },
  urlInclude: [
    ...videoAndBangumiUrls,
    ...liveUrls,
  ],
}
