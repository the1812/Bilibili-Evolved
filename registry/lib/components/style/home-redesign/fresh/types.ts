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
      blackboard: {
        linebreak: false,
        order: 1,
      },
      trending: {
        linebreak: true,
        order: 2,
      },
      feeds: {
        linebreak: false,
        order: 3,
      },
      areas: {
        linebreak: true,
        order: 4,
      },
      categories: {
        linebreak: false,
        order: 5,
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
