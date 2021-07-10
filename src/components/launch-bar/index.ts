import { none } from '@/core/utils'
import { ComponentMetadata, componentsTags } from '../types'

export const component: ComponentMetadata = {
  name: 'launchBar',
  displayName: 'Launch Bar',
  configurable: false,
  entry: none,
  hidden: true,
  tags: [
    componentsTags.general,
    componentsTags.utils,
  ],
  options: {
    searchHistory: {
      displayName: '搜索历史',
      defaultValue: [],
      hidden: true,
    },
  },
}
