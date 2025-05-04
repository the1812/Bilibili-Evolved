import { OptionsOfMetadata, defineOptionsMetadata } from '@/components/define'
import { getNumberValidator } from '@/core/utils'

export const badgeHelperOptions = defineOptionsMetadata({
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
export type BadgeHelperOptions = OptionsOfMetadata<typeof badgeHelperOptions>
