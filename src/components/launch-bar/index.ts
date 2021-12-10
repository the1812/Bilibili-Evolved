import { none } from '@/core/utils'
import { ComponentMetadata, componentsTags } from '../types'
import { plugin } from './plugin'

export const component: ComponentMetadata = {
  name: 'launchBar',
  displayName: '搜索栏',
  configurable: false,
  entry: none,
  plugin,
  hidden: true,
  tags: [
    componentsTags.general,
    componentsTags.utils,
  ],
}
