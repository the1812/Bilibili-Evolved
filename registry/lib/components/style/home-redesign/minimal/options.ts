import { defineOptionsMetadata } from '@/components/define'
import { getComponentSettings } from '@/core/settings'
import { getNumberValidator } from '@/core/utils'
import { MinimalHomeTabOption } from './types'

export const minimalHomeOptionsMetadata = defineOptionsMetadata({
  personalized: {
    displayName: '个性化推荐',
    defaultValue: false,
  },
  columnCount: {
    displayName: '自定义列数',
    defaultValue: 0,
    validator: getNumberValidator(0, 10),
  },
  defaultTab: {
    displayName: '默认标签页',
    defaultValue: MinimalHomeTabOption.Feeds,
    dropdownEnum: MinimalHomeTabOption,
  },
})
export const minimalHomeOptions = getComponentSettings<typeof minimalHomeOptionsMetadata>('minimalHome').options
