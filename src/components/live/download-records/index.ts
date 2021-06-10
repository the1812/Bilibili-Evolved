import { ComponentMetadata, componentsTags } from '@/components/component'
import { none } from '@/core/utils'

export const component: ComponentMetadata = {
  name: 'downloadLiveRecords',
  displayName: '直播录像下载',
  enabledByDefault: true,
  description: {
    'zh-CN': '在直播录像页面`live.bilibili.com/record/`中添加下载支持.',
  },
  tags: [
    componentsTags.live,
  ],
  entry: none,
  widget: {
    component: () => import('./DownloadRecords.vue').then(m => m.default),
  },
  urlInclude: [
    /^https:\/\/live\.bilibili\.com\/record\/(.+)/,
  ],
}
