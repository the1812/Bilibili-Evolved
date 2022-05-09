import { defineComponentMetadata } from '@/components/define'
import { options } from './options'

export const component = defineComponentMetadata({
  name: 'devClient',
  displayName: 'DevClient',
  tags: [componentsTags.utils],
  description: '本地开发工具',
  entry: async () => {
    import('./client')
  },
  options,
  widget: {
    component: () => import('./Widget.vue').then(m => m.default),
  },
})
