import { defineOptionsMetadata } from '@/components/define'
import { getNumberValidator } from '@/core/utils'
import type { FreshLayoutItemSettings } from './layouts/fresh-layout-item'

export enum RankListMode {
  Default = 'default',
  Compact = 'compact',
}

export const freshHomeOptionsMetadata = defineOptionsMetadata({
  layoutOptions: {
    displayName: '版块设置',
    defaultValue: {
      trending: {
        linebreak: true,
      },
      areas: {
        linebreak: true,
      },
    } satisfies Record<string, FreshLayoutItemSettings>,
    hidden: true,
  },
  personalized: {
    displayName: '个性化推荐',
    defaultValue: false,
  },
  horizontalWheelScroll: {
    displayName: '启用横向滚动',
    defaultValue: false,
  },
  maxWidth: {
    displayName: '最大宽度 (px)',
    defaultValue: 1440,
    validator: getNumberValidator(1000, 3000),
  },
  rankListMode: {
    displayName: '',
    defaultValue: RankListMode.Default,
    hidden: true,
  },
})
