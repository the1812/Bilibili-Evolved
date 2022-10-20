import { defineComponentMetadata } from '@/components/define'
import { getNumberValidator, getUID, none } from '@/core/utils'
import { autoMatchMedal } from './auto-match'

export const component = defineComponentMetadata({
  name: 'badgeHelper',
  displayName: '直播勋章快速更换',
  description: {
    'zh-CN':
      '在直播区中, 可从功能面板中直接切换勋章和头衔. 默认显示 256 个 (同时也是上限), 可在选项中修改.',
  },
  entry: () => autoMatchMedal(),
  reload: none,
  unload: none,
  tags: [componentsTags.live],
  widget: {
    component: () => import('./BadgeHelper.vue').then(m => m.default),
    condition: () => Boolean(getUID()),
  },
  options: {
    autoMatchMedal: {
      defaultValue: true,
      displayName: '自动佩戴当前直播间勋章',
    },
    maxBadgeCount: {
      defaultValue: 256,
      displayName: '最大显示数量',
      validator: getNumberValidator(1, 256),
    },
    defaultMedalID: {
      displayName: '默认勋章ID',
      hidden: true,
      defaultValue: 0,
    },
    grayEffect: {
      displayName: '显示勋章的未点亮状态',
      defaultValue: true,
    },
  },
  urlInclude: ['//live.bilibili.com'],
})
