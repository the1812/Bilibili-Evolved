import { formatDate } from '@/core/utils/formatters'
import { descendingStringSort } from '@/core/utils/sort'
import { omitCurrentYear } from './format-date'

export const groupFeedCardsByDate = <Card>(
  feedCards: Card[],
  getDate: (card: Card) => Date | undefined,
) => {
  const today = new Date()
  const todayLabel = formatDate(today)
  const dateAt = (daysAgo: number) =>
    new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysAgo)
  const dateLabels = new Map([
    [todayLabel, ''],
    [formatDate(dateAt(1)), '昨天'],
  ])
  for (let daysAgo = 2; daysAgo < 7; daysAgo += 1) {
    const date = dateAt(daysAgo)
    dateLabels.set(formatDate(date), date.toLocaleDateString('zh-CN', { weekday: 'short' }))
  }
  const cardsByDate = lodash.groupBy(feedCards, card => {
    const date = getDate(card)
    return date && Number.isFinite(date.getTime()) ? formatDate(date) : ''
  })
  return Object.entries(cardsByDate)
    .sort(descendingStringSort(([date]) => date))
    .map(([date, cards]) => ({
      date,
      label: dateLabels.get(date) ?? omitCurrentYear(date, todayLabel),
      cards,
    }))
}
