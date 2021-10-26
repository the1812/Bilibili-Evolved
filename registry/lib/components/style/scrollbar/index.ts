import { ComponentMetadata } from '@/components/types'

export const component: ComponentMetadata = {
  name: 'elegantScrollbar',
  entry: none,
  displayName: '使用细滚动条',
  tags: [
    componentsTags.style,
    componentsTags.general,
  ],
  instantStyles: [
    {
      name: 'elegant-scrollbar',
      style: () => import('./scrollbar.scss'),
    },
  ],
}
