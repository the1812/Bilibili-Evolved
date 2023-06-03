import { crossOriginLocalStorage } from '@/core/local-storage'
import { LaunchBarAction, LaunchBarActionProvider } from './launch-bar-action'

export interface HistoryItem {
  value: string
  timestamp: number
}
const SearchHistoryKey = 'search_history:search_history'
const SearchHistoryMaxItems = 20
export const getHistoryItems = async (key = SearchHistoryKey) => {
  const historyText = await crossOriginLocalStorage.getItem(key)
  const historyItems: HistoryItem[] = historyText ? JSON.parse(historyText) : []
  return historyItems
}
export const clearHistoryItems = (key = SearchHistoryKey) =>
  crossOriginLocalStorage.setItem(key, '[]')
export const addHistoryItem = async (keyword: string, key = SearchHistoryKey) => {
  console.log('add', keyword)
  await crossOriginLocalStorage.setItem(
    key,
    JSON.stringify(
      lodash
        .sortBy(
          lodash.uniqBy(
            [
              {
                value: keyword,
                timestamp: Number(new Date()),
              },
              ...(await getHistoryItems()),
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
export const deleteHistoryItem = async (keyword: string, key = SearchHistoryKey) => {
  const items = await getHistoryItems()
  const index = items.findIndex(it => it.value === keyword)
  console.log('delete', keyword, index)
  if (index !== -1) {
    items.splice(index, 1)
    await crossOriginLocalStorage.setItem(key, JSON.stringify(items))
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
      action: async () => {
        await clearHistoryItems()
      },
    }
    const historyItems = await getHistoryItems()
    const items = historyItems.map(
      it =>
        ({
          name: it.value,
          icon: 'mdi-history',
          // description: `在 ${formatDate(new Date(it.timestamp))} 搜索过`,
          explicitSelect: true,
          action: () => {
            search(it.value)
          },
          deleteAction: async () => {
            await deleteHistoryItem(it.value)
          },
        } as LaunchBarAction),
    )
    if (items.length > 0) {
      items.push(clearAction)
    }
    return items
  },
}
