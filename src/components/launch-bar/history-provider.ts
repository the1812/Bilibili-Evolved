// import { formatDate } from '@/core/utils/formatters'
import type { LaunchBarAction, LaunchBarActionProvider } from './launch-bar-action'

export interface HistoryItem {
  value: string
  isHistory: number
  timestamp: number
}
const SearchHistoryKey = 'search_history'
const SearchHistoryMaxItems = 12
export const getHistoryItems = (key = SearchHistoryKey) => {
  const historyText = localStorage.getItem(key)
  const historyItems: HistoryItem[] = historyText ? JSON.parse(historyText) : []
  return historyItems
}
export const clearHistoryItems = (key = SearchHistoryKey) => localStorage.setItem(key, '[]')
export const addHistoryItem = (keyword: string, key = SearchHistoryKey) => {
  console.log('add', keyword)
  localStorage.setItem(
    key,
    JSON.stringify(
      lodash
        .sortBy(
          lodash.uniqBy(
            [
              {
                value: keyword,
                isHistory: 1,
                timestamp: Number(new Date()),
              },
              ...getHistoryItems(),
            ],
            h => h.value,
          ),
          h => h.timestamp,
        )
        .reverse()
        .slice(0, SearchHistoryMaxItems),
    ),
  )
}
export const deleteHistoryItem = (keyword: string, key = SearchHistoryKey) => {
  const items = getHistoryItems()
  const index = items.findIndex(it => it.value === keyword)
  console.log('delete', keyword, index)
  if (index !== -1) {
    items.splice(index, 1)
    localStorage.setItem(key, JSON.stringify(items))
  }
}
export const historyProvider: LaunchBarActionProvider = {
  name: 'history',
  getActions: async () => {
    const { search } = await import('./search-provider')
    const clearAction: LaunchBarAction = {
      name: '清除搜索历史',
      icon: 'mdi-trash-can-outline',
      description: 'Clear History',
      explicitSelect: true,
      action: () => {
        clearHistoryItems()
      },
    }
    const items = getHistoryItems().map(
      it =>
        ({
          name: it.value,
          icon: 'mdi-history',
          // description: `在 ${formatDate(new Date(it.timestamp))} 搜索过`,
          explicitSelect: true,
          action: () => {
            search(it.value)
          },
          deleteAction: () => {
            deleteHistoryItem(it.value)
          },
        } as LaunchBarAction),
    )
    if (items.length > 0) {
      items.push(clearAction)
    }
    return items
  },
}
