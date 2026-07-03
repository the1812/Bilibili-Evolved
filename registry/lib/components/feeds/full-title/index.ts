import { defineComponentMetadata } from '@/components/define'
import { toggleStyle } from '@/components/styled-component'

export const component = defineComponentMetadata({
  ...toggleStyle('fullFeedsTitle', () => import('./full-feeds-title.scss')),
  displayName: '展开动态标题',
  tags: [componentsTags.feeds, componentsTags.style],
})
