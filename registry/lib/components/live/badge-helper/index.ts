import { ComponentMetadata } from '@/components/types'
import { getUID, none } from '@/core/utils'
import { autoMatchMedal } from './auto-match'

export const component: ComponentMetadata = {
  name: 'badgeHelper',
  displayName: '直播勋章快速更换',
  description: {
    'zh-CN': '在直播区中, 可从功能面板中直接切换勋章和头衔.',
  },
  enabledByDefault: true,
  entry: () => autoMatchMedal(),
  reload: none,
  unload: none,
  tags: [
    componentsTags.live,
  ],
  widget: {
    component: () => import('./BadgeHelper.vue').then(m => m.default),
    condition: () => Boolean(getUID()),
  },
  options: {
    autoMatchMedal: {
      defaultValue: true,
      displayName: '自动佩戴当前直播间勋章',
    },
    defaultMedalID: {
      displayName: '默认勋章ID',
      hidden: true,
      defaultValue: 0,
    },
  },
  urlInclude: [
    '//live.bilibili.com',
  ],
}
