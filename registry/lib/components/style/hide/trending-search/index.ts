import { defineComponentMetadata } from '@/components/define'
import { allMutations } from '@/core/observer'
import { select } from '@/core/spin-query'

const DEFAULT_PLACEHOLDER = '搜索'

const resetPlaceholder = (input: HTMLInputElement) => {
  input.placeholder = DEFAULT_PLACEHOLDER
  input.title = DEFAULT_PLACEHOLDER
}

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
    const input: HTMLInputElement = await select('input.nav-search-input', {
      queryInterval: 500,
    })

    if (input) {
      resetPlaceholder(input)
      return
    }

    // Fallback to observer
    allMutations(records => {
      records.forEach(record => {
        if (
          record.target instanceof HTMLInputElement &&
          record.target.classList.contains('nav-search-input') &&
          record.target.placeholder !== DEFAULT_PLACEHOLDER
        ) {
          resetPlaceholder(record.target)
        }
      })
    })
  },
})
