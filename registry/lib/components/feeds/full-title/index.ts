import { defineComponentMetadata } from '@/components/define'

export const component = defineComponentMetadata({
  name: 'fullFeedsTitle',
  displayName: '展开动态标题',
  tags: [componentsTags.feeds, componentsTags.style],
  instantStyles: [{ name: 'fullFeedsTitle', style: () => import('./full-feeds-title.scss') }],
  entry: none,
})
