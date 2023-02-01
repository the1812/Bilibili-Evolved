import { defineComponentMetadata } from '@/components/define'
import { none } from '@/core/utils'

import { componentsTags } from '../types'
import { plugin } from './plugin'

export const component = defineComponentMetadata({
  name: 'launchBar',
  displayName: '搜索栏',
  configurable: false,
  entry: none,
  plugin,
  hidden: true,
  tags: [componentsTags.general, componentsTags.utils],
})
