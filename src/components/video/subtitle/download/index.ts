import { ComponentMetadata, componentsTags } from '@/components/component'
import { none } from '@/core/utils'
import { hasVideo } from '@/core/spin-query'

export const component: ComponentMetadata = {
  name: 'downloadSubtitle',
  displayName: '下载字幕',
  enabledByDefault: true,
  description: {
    'zh-CN': '启用下载字幕支持, 在视频页面中可从功能面板里下载字幕.',
  },
  tags: [
    componentsTags.video,
  ],
  entry: none,
  urlInclude: [
    '//www.bilibili.com/video/',
  ],
  widget: {
    condition: hasVideo,
    component: () => import('./DownloadSubtitle.vue').then(m => m.default),
  },
}
