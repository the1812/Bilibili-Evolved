import { Range } from '@/ui/range'

const minutesPerDay = 24 * 60
const millisecondsPerDay = minutesPerDay * 60 * 1000
const timeRegex = /^(\d{1,2}):(\d{1,2})$/
const pad = (value: number) => value.toString().padStart(2, '0')

const toMinutes = (time: string) => {
  const [hour, minute] = time.split(':').map(it => parseInt(it) || 0)
  return (hour * 60 + minute) % minutesPerDay
}

/** `6:00` → `06:00`, 超出一天的部分会归一化 */
const normalizeTime = (time: string) => {
  const minutes = toMinutes(time)
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`
}

export const rangeValidator = ({ start, end }: Range<string>) =>
  timeRegex.test(start) && timeRegex.test(end)
    ? { start: normalizeTime(start), end: normalizeTime(end) }
    : null

const currentTime = () => {
  const now = new Date()
  return { minutes: now.getHours() * 60 + now.getMinutes(), seconds: now.getSeconds() }
}

// 起始含, 结束不含, 跨天视为次日
const isInRange = (now: number, start: number, end: number) =>
  start !== end && (start < end ? now >= start && now < end : now >= start || now < end)

export const isInTimeRange = ({ start, end }: Range<string>) =>
  isInRange(currentTime().minutes, toMinutes(start), toMinutes(end))

export const millisecondsUntilChange = ({ start, end }: Range<string>) => {
  const { minutes, seconds } = currentTime()
  const startMinutes = toMinutes(start)
  const endMinutes = toMinutes(end)
  const target = isInRange(minutes, startMinutes, endMinutes) ? endMinutes : startMinutes
  const diff = (target - minutes) * 60000 - seconds * 1000
  return diff > 0 ? diff : diff + millisecondsPerDay
}
