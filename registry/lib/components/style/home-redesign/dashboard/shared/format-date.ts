import { formatDate, formatTime } from '@/core/utils/formatters'

const yesterday = (date: Date) => {
  date.setDate(date.getDate() - 1)
  return date
}
const weekdayOf = (date: Date) => date.toLocaleDateString('zh-CN', { weekday: 'short' })

const cacheDate = () => {
  const day = new Date()
  const date = formatDate(day)
  return {
    date,
    year: date.slice(0, 4),
    labels: new Map([
      [date, ''],
      [formatDate(yesterday(day)), '昨天'],
      [formatDate(yesterday(day)), '前天'],
      [formatDate(yesterday(day)), weekdayOf(day)],
      [formatDate(yesterday(day)), weekdayOf(day)],
      [formatDate(yesterday(day)), weekdayOf(day)],
      [formatDate(yesterday(day)), weekdayOf(day)],
    ]),
  }
}

let dateCache = cacheDate()

/** 格式化日期：今天为空字符串，七日内为别名，年内为 `MM-DD`，其余为 `YYYY-MM-DD` */
export const formatDateLabel = (date: Date | string) => {
  if (date instanceof Date) {
    date = formatDate(date)
  }
  if (dateCache.date !== formatDate(new Date())) {
    dateCache = cacheDate()
  }
  return dateCache.labels.get(date) ?? (date.startsWith(dateCache.year) ? date.slice(5) : date)
}

/** 格式化时间：`HH:mm` */
export const formatTimeLabel = (date: Date) => {
  return formatTime(date).slice(0, 5)
}

/** 格式化日期时间：{@link formatDateLabel} 与 {@link formatTimeLabel} */
export const formatDateTimeLabel = (date: Date) => {
  return `${formatDateLabel(date)} ${formatTimeLabel(date)}`.trim()
}
