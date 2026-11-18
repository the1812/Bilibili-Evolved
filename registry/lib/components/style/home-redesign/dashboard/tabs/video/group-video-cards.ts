import type { VideoCard } from '@/components/feeds/video-card'
import { formatDate } from '@/core/utils/formatters'
import { descendingStringSort } from '@/core/utils/sort'

export const groupVideoCardsByDate = (videoCards: VideoCard[]) => {
  const today = new Date()
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
  const dateLabels = {
    [formatDate(today)]: '今天',
    [formatDate(yesterday)]: '昨天',
  }
  const cardsByDate = lodash.groupBy(videoCards, ({ time }) =>
    time && Number.isFinite(time.getTime()) ? formatDate(time) : '',
  )
  return Object.entries(cardsByDate)
    .sort(descendingStringSort(([date]) => date))
    .map(([date, cards]) => ({
      date,
      label: dateLabels[date] ?? date.slice(5).replace('-', '/'),
      cards,
    }))
}
