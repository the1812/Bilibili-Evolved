import { defineOptionsMetadata, OptionsOfMetadata } from '@/components/define'
import { getComponentSettings } from '@/core/settings'

export interface BackgroundImage {
  name: string
  url: string
}

export const LOCAL_UPLOAD_LIMIT_KIB = 1024

export const emptyBackgroundImage = (): BackgroundImage => ({
  name: '',
  url: '',
})

export const searchHomeOptionsMetadata = defineOptionsMetadata({
  backgroundColor: {
    displayName: '背景颜色',
    defaultValue: '#000000',
    color: true,
  },
  backgroundImage: {
    displayName: '背景图片',
    defaultValue: {
      name: '',
      url: 'https://i1.hdslb.com/bfs/static/jinkela/long/images/dynamic/bg.png',
    },
    hidden: true,
  },
})

export type SearchHomeOptions = OptionsOfMetadata<typeof searchHomeOptionsMetadata>

export const getSearchHomeOptions = () =>
  getComponentSettings<SearchHomeOptions>('searchHome').options
