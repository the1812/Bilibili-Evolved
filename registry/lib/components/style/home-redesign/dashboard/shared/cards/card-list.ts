import { formatDate } from '@/core/utils/formatters'
import { descendingStringSort } from '@/core/utils/sort'
import { formatDateLabel } from '../format-date'

export const getCardList = <Card>(
  cards: Card[],
  { groupByDate, getDate }: { groupByDate: boolean; getDate: (card: Card) => Date | undefined },
) => {
  if (!groupByDate) {
    return { dated: false, groups: cards.length ? [{ date: '', label: '', cards }] : [] }
  }
  const byDate = lodash.groupBy(cards, card => {
    const date = getDate(card)
    return date && Number.isFinite(date.getTime()) ? formatDate(date) : ''
  })
  const groups = Object.entries(byDate)
    .sort(descendingStringSort(([date]) => date))
    .map(([date, group]) => ({
      date,
      label: formatDateLabel(date),
      cards: group,
    }))
  return { dated: groups.some(group => group.date), groups }
}
