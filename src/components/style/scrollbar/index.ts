import { ComponentMetadata, componentsTags } from '@/components/component'
import { toggleStyle } from '@/components/styled-component'

export const component: ComponentMetadata = {
  name: 'elegantScrollbar',
  displayName: '使用细滚动条',
  tags: [
    componentsTags.style,
    componentsTags.general,
  ],
  ...toggleStyle(() => import('./scrollbar.scss')),
  instantStyles: [
    {
      name: 'elegant-scrollbar',
      style: () => import('./scrollbar.scss'),
    },
  ],
}
