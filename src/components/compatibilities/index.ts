// import { addComponentListener } from '@/core/settings'
import { componentsTags } from '@/components/types'
import { none } from '@/core/utils'
import { defineComponentMetadata } from '../define'

export const component = defineComponentMetadata({
  name: 'compatibilities',
  displayName: '兼容性选项',
  configurable: false,
  tags: [componentsTags.general],
  options: {
    disableOnBalh: {
      defaultValue: false,
      displayName: '与 "解除 B 站区域限制" 互斥',
    },
  },
  entry: none,
})
