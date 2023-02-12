import { defineAsyncComponent } from 'vue'

import type { OptionsOfMetadata } from '@/components/define'
import { defineComponentMetadata, defineOptionsMetadata } from '@/components/define'
import { getNumberValidator, getUID, none } from '@/core/utils'

import { autoMatchMedal } from './auto-match'

const options = defineOptionsMetadata({
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
})

export type Options = OptionsOfMetadata<typeof options>

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
    component: defineAsyncComponent(() => import('./BadgeHelper.vue')),
    condition: () => Boolean(getUID()),
  },
  options,
  urlInclude: ['//live.bilibili.com'],
})
