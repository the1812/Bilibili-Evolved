import { ComponentMetadata, componentsTags } from '@/components/component'
import { none } from '@/core/utils'
import { liveUrls } from '../live-urls'

export const component: ComponentMetadata = {
  name: 'recordLiveDanmaku',
  displayName: '直播弹幕记录器',
  enabledByDefault: false,
  description: {
    'zh-CN': '在功能中添加直播弹幕记录器, 可以记录直播弹幕并导出XML.',
  },
  entry: none,
  tags: [
    componentsTags.live,
  ],
  widget: {
    component: () => import('./RecordDanmaku.vue').then(m => m.default),
  },
  urlInclude: liveUrls,
}
