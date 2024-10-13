import { defineComponentMetadata } from '@/components/define'

export const component = defineComponentMetadata({
  name: 'hideUserPendent',
  displayName: '隐藏头像框',
  entry: none,
  tags: [componentsTags.style],
  instantStyles: [
    {
      name: 'hide-user-pendent',
      style: () => import('./user-pendent.scss'),
    },
    {
      name: 'hide-user-pendent',
      style: () => import('./user-pendent-shadow.scss'),
      shadowDom: true,
    },
  ],
})
