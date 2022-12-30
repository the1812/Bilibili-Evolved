import {
  defineComponentMetadata,
  defineOptionsMetadata,
  OptionsOfMetadata,
} from '@/components/define'
import { fullyLoaded } from '@/core/life-cycle'
import { ComponentSettings, getComponentSettings } from '@/core/settings'
import { Range } from '@/ui/range'
import { darkExcludes } from '../dark-urls'

class ScheduleTime {
  hour: number
  minute: number
  constructor(...args: [] | [string] | [number, number]) {
    if (args.length === 0) {
      const now = new Date()
      this.hour = now.getHours()
      this.minute = now.getMinutes()
    } else if (args.length === 1) {
      const [text] = args
      ;[this.hour, this.minute] = text
        .split(':')
        .slice(0, 2)
        .map(it => ScheduleTime.validatePart(it))
      this.normalize()
    } else if (args.length === 2) {
      ;[this.hour, this.minute] = args
    }
  }
  normalize() {
    while (this.minute < 0) {
      this.minute += 60
      this.hour -= 1
    }
    while (this.minute >= 60) {
      this.minute -= 60
      this.hour += 1
    }
    while (this.hour < 0) {
      this.hour += 24
    }
    while (this.hour >= 24) {
      this.hour -= 24
    }
  }
  lessThan(other: ScheduleTime) {
    if (this.hour < other.hour || (this.hour === other.hour && this.minute < other.minute)) {
      return true
    }
    return false
  }
  greaterThan(other: ScheduleTime) {
    if (this.hour > other.hour || (this.hour === other.hour && this.minute > other.minute)) {
      return true
    }
    return false
  }
  equals(other: ScheduleTime) {
    return this.hour === other.hour && this.minute === other.minute
  }
  isInRange(start: ScheduleTime, end: ScheduleTime) {
    if (start.equals(end)) {
      return false
    }
    let inRange = this.greaterThan(start) && this.lessThan(end)
    if (start.greaterThan(end)) {
      inRange = this.greaterThan(start) || this.lessThan(end)
    }
    const result = inRange || this.equals(start)
    return result
  }
  toString() {
    return `${this.hour.toString().padStart(2, '0')}:${this.minute.toString().padStart(2, '0')}`
  }
  static validatePart(text: string) {
    const number = parseInt(text)
    if (!Number.isNaN(number) && number >= 0 && number <= 59) {
      return number
    }
    return null
  }
  static millisecondsBefore(time: ScheduleTime) {
    const now = new ScheduleTime()
    const nowSeconds = new Date().getSeconds()
    const currentMilliseconds = 1000 * (now.hour * 3600 + now.minute * 60 + nowSeconds)
    const targetMilliseconds = 1000 * (time.hour * 3600 + time.minute * 60)
    let result = targetMilliseconds - currentMilliseconds
    if (now.greaterThan(time) || (now.equals(time) && nowSeconds !== 0)) {
      result += 24 * 3600 * 1000
    }
    return result
  }
}

const options = defineOptionsMetadata({
  range: {
    defaultValue: {
      start: '18:00',
      end: '6:00',
    },
    displayName: '时间段',
    validator: (range: Range<string>) => {
      const { start, end } = range
      const regex = /^(\d{1,2}):(\d{1,2})$/
      if (!regex.test(start) || !regex.test(end)) {
        return null
      }
      const startTime = new ScheduleTime(range.start)
      const endTime = new ScheduleTime(range.end)
      return {
        start: startTime.toString(),
        end: endTime.toString(),
      }
    },
  },
})

type Options = OptionsOfMetadata<typeof options>

const checkTime = (settings: ComponentSettings<Options>) => {
  const start = new ScheduleTime(settings.options.range.start)
  const end = new ScheduleTime(settings.options.range.end)
  const now = new ScheduleTime()
  const useDarkMode = now.isInRange(start, end)
  const darkModeSettings = getComponentSettings('darkMode')
  if (darkModeSettings.enabled !== useDarkMode) {
    darkModeSettings.enabled = useDarkMode
  }
  let timeout = 0
  if (useDarkMode) {
    timeout = ScheduleTime.millisecondsBefore(end)
  } else {
    timeout = ScheduleTime.millisecondsBefore(start)
  }
  if (timeout !== 0) {
    setTimeout(() => checkTime(settings), timeout)
  }
}

export const component = defineComponentMetadata({
  name: 'darkModeSchedule',
  displayName: '夜间模式计划时段',
  description:
    '设置一个使用夜间模式的时间段, 进入 / 离开此时间段时, 会自动开启 / 关闭夜间模式. 结束时间小于起始时间时将视为次日, 如 `18:00` 至 `6:00` 表示晚上 18:00 到次日 6:00. 请勿和 `夜间模式跟随系统` 一同使用.',
  tags: [componentsTags.style, componentsTags.general],
  entry: ({ settings }) => fullyLoaded(() => checkTime(settings)),
  urlExclude: darkExcludes,
  options,
})
