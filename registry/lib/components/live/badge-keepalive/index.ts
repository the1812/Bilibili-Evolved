import {
  OptionsOfMetadata,
  defineComponentMetadata,
  defineOptionsMetadata,
} from '@/components/define'
import { getUID, getNumberValidator } from '@/core/utils'
import { liveUrls } from '@/core/utils/urls'

const options = defineOptionsMetadata({
  defaultClickTimes: {
    displayName: '默认点赞次数',
    defaultValue: '300',
    validator: getNumberValidator(1, 3000),
  },
})
export type Options = OptionsOfMetadata<typeof options>
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
  options,
  urlInclude: liveUrls,
})
