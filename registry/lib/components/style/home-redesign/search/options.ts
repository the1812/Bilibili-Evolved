import { defineOptionsMetadata, OptionsOfMetadata } from '@/components/define'
import { getComponentSettings } from '@/core/settings'

export const searchHomeOptionsMetadata = defineOptionsMetadata({
  backgroundColor: {
    displayName: '背景颜色',
    defaultValue: '#ffffff',
    color: true,
  },
  backgroundImage: {
    displayName: '背景图片 URL',
    defaultValue: '',
  },
})

export type SearchHomeOptions = OptionsOfMetadata<typeof searchHomeOptionsMetadata>

export const searchHomeOptions = getComponentSettings<SearchHomeOptions>('searchHome').options
