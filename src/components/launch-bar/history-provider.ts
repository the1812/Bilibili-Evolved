import { getComponentSettings } from '@/core/settings'
import { ascendingSort } from '@/core/utils/sort'
import { LaunchBarActionProvider } from './launch-bar-action'

export interface LaunchBarHistory {
  keyword: string
  count: number
  date: number
}
const { searchHistory: history } = getComponentSettings('launchBar').options as {
  searchHistory: LaunchBarHistory[]
}
const MaxHistoryCount = 12
export const clearHistory = () => {
  while (history.length > 0) {
    history.pop()
  }
}
export const deleteHistory = (item: string | LaunchBarHistory) => {
  const historyItem = typeof item === 'string'
    ? history.find(it => it.keyword.toLowerCase() === item.toLowerCase()) : item
  if (!historyItem) {
    return
  }
  const index = history.indexOf(historyItem)
  if (index === -1) {
    return
  }
  console.log('delete', historyItem)
  history.splice(index, 1)
}
export const updateHistory = (keyword: string) => {
  // keyword = keyword.toLowerCase()
  const item = history.find(it => it.keyword.toLowerCase() === keyword.toLowerCase())
  if (item) {
    item.count++
    item.date = Number(new Date())
  } else {
    history.unshift({
      keyword,
      count: 1,
      date: Number(new Date()),
    })
    if (history.length > MaxHistoryCount) {
      const oldestItem = [...history].sort((a, b) => {
        if (a.date === b.date) {
          return ascendingSort<LaunchBarHistory>(it => it.count)(a, b)
        }
        return ascendingSort<LaunchBarHistory>(it => it.date)(a, b)
      })[0]
      history.splice(history.indexOf(oldestItem), 1)
    }
  }
}
export const historyProvider: LaunchBarActionProvider = {
  name: 'history',
  getActions: async () => {
    const { search } = await import('./search-provider')
    return history.map(it => ({
      name: it.keyword,
      action: () => {
        search(it.keyword)
      },
    }))
  },
}
