import { defineAsyncComponent } from 'vue'

import { defineComponentMetadata } from '@/components/define'
import { liveUrls } from '@/core/utils/urls'

export const component = defineComponentMetadata({
  name: 'livePip',
  displayName: '直播画中画',
  description: {
    'zh-CN':
      '在直播间的功能面板中启用画中画支持, 不过现在好像 b 站已经直接支持了, 后续可能会删掉这个功能.',
  },
  entry: none,
  tags: [componentsTags.live],
  widget: {
    component: defineAsyncComponent(() => import('./LivePip.vue')),
    condition: () => 'requestPictureInPicture' in HTMLVideoElement.prototype,
  },
  urlInclude: liveUrls,
})
