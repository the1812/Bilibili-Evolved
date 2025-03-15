import { defineComponentMetadata } from '@/components/define'
import { getUID } from '@/core/utils'

export const component = defineComponentMetadata({
  name: 'badgeKeepalive',
  displayName: '一键点亮直播间粉丝勋章',
  entry: () => {},
  reload: none,
  unload: none,
  tags: [componentsTags.live],
  condition: () => Boolean(getUID()),
  widget: {
    component: () => import('./BadgeKeepalive.vue').then(m => m.default),
  },
  urlInclude: ['//live.bilibili.com'],
})
