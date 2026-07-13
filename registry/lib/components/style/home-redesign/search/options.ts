import { defineOptionsMetadata, OptionsOfMetadata } from '@/components/define'
import { getComponentSettings } from '@/core/settings'

export const emptyBackgroundImage = () => ({
  name: '',
  url: '',
})

export const searchHomeOptionsMetadata = defineOptionsMetadata({
  backgroundColor: {
    displayName: '背景颜色',
    defaultValue: '#ffffff',
    color: true,
  },
  backgroundImage: {
    displayName: '背景图片',
    defaultValue: emptyBackgroundImage(),
  },
})

export type SearchHomeOptions = OptionsOfMetadata<typeof searchHomeOptionsMetadata>

export const getSearchHomeOptions = () =>
  getComponentSettings<SearchHomeOptions>('searchHome').options
