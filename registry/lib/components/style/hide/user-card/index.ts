import { defineComponentMetadata } from '@/components/define'
import { toggleStyle } from '@/components/styled-component'

const name = 'hideUserCard'

export const component = defineComponentMetadata({
  displayName: '隐藏用户信息卡片',
  description: {
    'zh-CN': '隐藏鼠标指向用户名或用户头像时弹出的浮动用户信息卡片',
  },
  author: {
    name: 'WakelessSloth56',
    link: 'https://github.com/WakelessSloth56',
  },
  tags: [componentsTags.style],
  ...toggleStyle(name, () => import('./user-card.scss')),
})
