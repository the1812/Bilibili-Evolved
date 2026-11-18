import type { VideoCard } from '@/components/feeds/video-card'
import { formatDate } from '@/core/utils/formatters'
import { descendingStringSort } from '@/core/utils/sort'

export const groupVideoCardsByDate = (videoCards: VideoCard[]) => {
  const yesterday = (date: Date) => {
    date.setDate(date.getDate() - 1)
    return date
  }
  const formatWeekday = (date: Date) => date.toLocaleDateString('zh-CN', { weekday: 'short' })
  const day = new Date()
  const dateLabels = {
    [formatDate(day)]: '',
    [formatDate(yesterday(day))]: '昨天',
    [formatDate(yesterday(day))]: formatWeekday(day),
    [formatDate(yesterday(day))]: formatWeekday(day),
    [formatDate(yesterday(day))]: formatWeekday(day),
    [formatDate(yesterday(day))]: formatWeekday(day),
    [formatDate(yesterday(day))]: formatWeekday(day),
  }
  const cardsByDate = lodash.groupBy(videoCards, ({ time }) =>
    time && Number.isFinite(time.getTime()) ? formatDate(time) : '',
  )
  return Object.entries(cardsByDate)
    .sort(descendingStringSort(([date]) => date))
    .map(([date, cards]) => ({
      date,
      label: dateLabels[date] ?? date.slice(5),
      cards,
    }))
}
