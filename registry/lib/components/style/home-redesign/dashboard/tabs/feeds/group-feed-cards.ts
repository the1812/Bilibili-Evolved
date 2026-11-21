import { formatDate } from '@/core/utils/formatters'
import { descendingStringSort } from '@/core/utils/sort'
import { formatDateLabel } from '../../shared/format-date'

export const groupCardsByDate = <Card>(
  cards: Card[],
  getDate: (card: Card) => Date | undefined,
) => {
  const groups = lodash.groupBy(cards, card => {
    const date = getDate(card)
    return date && Number.isFinite(date.getTime()) ? formatDate(date) : ''
  })
  return Object.entries(groups)
    .sort(descendingStringSort(([date]) => date))
    .map(([date, group]) => ({
      date,
      label: formatDateLabel(date),
      cards: group,
    }))
}
