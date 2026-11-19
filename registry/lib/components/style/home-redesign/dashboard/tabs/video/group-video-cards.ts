import type { VideoCard } from '@/components/feeds/video-card'
import { formatDate } from '@/core/utils/formatters'
import { descendingStringSort } from '@/core/utils/sort'
import { omitCurrentYear } from '../../shared/format-date'

export const groupVideoCardsByDate = <Card extends VideoCard>(videoCards: Card[]) => {
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
  const cardsByDate = lodash.groupBy(videoCards, ({ time }) =>
    time && Number.isFinite(time.getTime()) ? formatDate(time) : '',
  )
  return Object.entries(cardsByDate)
    .sort(descendingStringSort(([date]) => date))
    .map(([date, cards]) => ({
      date,
      label: dateLabels.get(date) ?? omitCurrentYear(date, todayLabel),
      cards,
    }))
}
