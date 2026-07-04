import { defineComponentMetadata } from '@/components/define'
import { none } from '@/core/utils'

const name = 'hideUserCard'

export const component = defineComponentMetadata({
  name,
  displayName: '隐藏用户信息卡片',
  author: {
    name: 'WakelessSloth56',
    link: 'https://github.com/WakelessSloth56',
  },
  tags: [componentsTags.style],
  instantStyles: [
    {
      name,
      style: () => import('./user-card.scss'),
    },
  ],
  entry: none,
})
