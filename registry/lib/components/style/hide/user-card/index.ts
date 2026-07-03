import { defineComponentMetadata } from '@/components/define'
import { toggleStyle } from '@/components/styled-component'

const name = 'hideUserCard'

export const component = defineComponentMetadata({
  displayName: '隐藏用户信息卡片',
  author: {
    name: 'WakelessSloth56',
    link: 'https://github.com/WakelessSloth56',
  },
  tags: [componentsTags.style],
  ...toggleStyle(name, () => import('./user-card.scss')),
})
