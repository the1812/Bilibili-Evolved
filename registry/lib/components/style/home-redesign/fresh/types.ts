import { defineOptionsMetadata } from '@/components/define'
import { getNumberValidator } from '@/core/utils'
import type { FreshLayoutItemSettings } from './layouts/fresh-layout-item'
import { areaPrimaryTitleColorEnum } from './init-dropdown-options/area-primary-title-color'

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
        // as boolean 一下, 不然 TS 会推断为只能 false
        hidden: false as boolean,
      },
      trending: {
        linebreak: true,
        order: 2,
        hidden: false,
      },
      feeds: {
        linebreak: false,
        order: 3,
        hidden: false,
      },
      areas: {
        linebreak: true,
        order: 4,
        hidden: false,
      },
      categories: {
        linebreak: false,
        order: 5,
        hidden: false,
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
  areaPrimaryTitleColor: {
    displayName: '栏目主标题颜色',
    dropdownEnum: areaPrimaryTitleColorEnum,
    defaultValue: areaPrimaryTitleColorEnum.Dark,
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
