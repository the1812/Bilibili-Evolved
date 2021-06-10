import { none } from '@/core/utils'
import { ComponentMetadata, componentsTags } from '../../component'

export const component: ComponentMetadata = {
  name: 'biliplusRedirect',
  displayName: 'BiliPlus跳转支持',
  description: /* html */'在视频/番剧/空间中, 附加功能<span>"转到BiliPlus"</span>, 点击可以转到BiliPlus上对应的页面.',
  urlInclude: [
    'bilibili.com/video/',
    'bilibili.com/bangumi/play',
    'bilibili.com/bangumi/media',
    'space.bilibili.com',
  ],
  enabledByDefault: false,
  entry: none,
  tags: [
    componentsTags.utils,
  ],
  widget: {
    component: () => import('./BiliplusRedirect.vue').then(m => m.default),
  },
}
