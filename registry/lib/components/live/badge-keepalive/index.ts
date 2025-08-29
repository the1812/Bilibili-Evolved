import { defineComponentMetadata } from '@/components/define'
import { getUID } from '@/core/utils'
import { liveUrls } from '@/core/utils/urls'

export const component = defineComponentMetadata({
  name: 'badgeKeepalive',
  displayName: '一键点亮直播间粉丝勋章',
  entry: none,
  reload: none,
  unload: none,
  author: {
    name: 'magicFeirl',
    link: 'https://github.com/magicFeirl',
  },
  tags: [componentsTags.live],
  widget: {
    component: () => import('./BadgeKeepalive.vue').then(m => m.default),
    condition: () => Boolean(getUID()),
  },
  urlInclude: liveUrls,
})
