import { defineComponentMetadata } from '@/components/define'
import { matchUrlPattern } from '@/core/utils'

export const component = defineComponentMetadata({
  name: 'originalLiveroom',
  displayName: '返回原版直播间',
  description:
    '在直播间中提供返回原版直播间的按钮, 原版直播间将无视活动皮肤, 强制使用标准的直播页面.',
  tags: [componentsTags.live],
  entry: none,
  urlInclude: [
    // 不能直接用 liveUrls, 那个是带 blanc 检测的
    /^https:\/\/live\.bilibili\.com\/[\d]+/,
  ],
  widget: {
    component: () => import('./Widget.vue').then(m => m.default),
    condition: () => matchUrlPattern(/^https:\/\/live\.bilibili\.com\/([\d]+)/),
  },
})
