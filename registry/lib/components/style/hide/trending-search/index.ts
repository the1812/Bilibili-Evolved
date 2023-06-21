import { defineComponentMetadata } from '@/components/define'
import { allMutations } from '@/core/observer'

export const component = defineComponentMetadata({
  name: 'hideTrendingSearch',
  displayName: '隐藏热搜',
  tags: [componentsTags.style],
  instantStyles: [
    {
      name: 'hideTrendingSearch',
      style: () => import('./hide-trending-search.scss'),
    },
  ],
  entry: async () => {
    allMutations(records => {
      records.forEach(record => {
        if (
          record.target instanceof HTMLInputElement &&
          record.target.classList.contains('nav-search-input') &&
          record.target.placeholder !== '搜索'
        ) {
          record.target.placeholder = '搜索'
        }
      })
    })
  },
})
