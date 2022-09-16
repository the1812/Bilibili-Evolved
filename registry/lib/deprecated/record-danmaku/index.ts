import { defineComponentMetadata } from '@/components/define'
import { none } from '@/core/utils'
import { liveUrls } from '@/core/utils/urls'

export const component = defineComponentMetadata({
  name: 'recordLiveDanmaku',
  displayName: '直播弹幕记录器',
  description: {
    'zh-CN': '在功能中添加直播弹幕记录器, 可以记录直播弹幕并导出XML.',
  },
  entry: none,
  tags: [componentsTags.live],
  widget: {
    component: () => import('./RecordDanmaku.vue').then(m => m.default),
  },
  urlInclude: liveUrls,
})
