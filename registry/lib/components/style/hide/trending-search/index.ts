import { defineComponentMetadata } from '@/components/define'
import { allMutations } from '@/core/observer'
import { select } from '@/core/spin-query'

const DEFAULT_PLACEHOLDER = '搜索'

const resetPlaceholder = (input: HTMLInputElement) => {
  input.placeholder = DEFAULT_PLACEHOLDER
  input.title = DEFAULT_PLACEHOLDER
}

const isInLiveRoomPage = () => {
  return window.location.host === 'live.bilibili.com'
}

const getSearchInputClassName = () => {
  return isInLiveRoomPage() ? 'input.nav-search-content' : 'input.nav-search-input'
}

const isSearchInput = (target: any) => {
  if (!(target instanceof HTMLInputElement)) {
    return false
  }

  const isSearch = ['nav-search-content', 'nav-search-input'].some(n =>
    target.classList.contains(n),
  )

  return target.placeholder !== DEFAULT_PLACEHOLDER && isSearch
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
    const clsName = getSearchInputClassName()
    const input: HTMLInputElement = await select(clsName, {
      queryInterval: 500,
    })

    if (input) {
      resetPlaceholder(input)
      return
    }

    // Fallback to observer
    allMutations(records => {
      records.forEach(record => {
        if (isSearchInput(record.target)) {
          resetPlaceholder(record.target as HTMLInputElement)
        }
      })
    })
  },
})
