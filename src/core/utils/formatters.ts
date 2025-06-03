/** 格式化文件大小, 最小单位为Byte
 * @param bytes 字节数
 * @param fixed 保留的小数位, 默认为`1`
 */
export const formatFileSize = (bytes: number, fixed = 1) => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  let number = bytes
  let unitIndex = 0
  while (number >= 1024) {
    number /= 1024
    unitIndex++
  }
  return `${Math.round(number * 10 ** fixed) / 10 ** fixed}${units[unitIndex]}`
}
/**
 * 格式化百分数为带`%`的字符串
 * @param percent 百分数
 * @param fixed 保留的小数位, 默认为`1`
 */
export const formatPercent = (percent: number, fixed = 1) =>
  `${Math.round(percent * 100 * 10 ** fixed) / 10 ** fixed}%`

/**
 * 将时长文本转换为秒数
 * @param durationText 时长文本
 */
export const parseDuration = (durationText: string) => {
  const parts = durationText.split(':')
  let result = 0
  parts.forEach((part, index) => {
    const isLastPart = index === parts.length - 1
    const partNumber = isLastPart ? parseFloat(part) : parseInt(part)
    if (Number.isNaN(partNumber)) {
      return
    }
    result += partNumber * 60 ** (parts.length - 1 - index)
  })
  return result
}
/** 格式化时长为 `H:mm:ss.F`, 不足1小时则为 `mm:ss.F`
 * @param time 时长 (秒)
 * @param fixed 保留的小数位 (毫秒), 默认不保留
 */
export const formatDuration = (time: number, fixed = 0) => {
  const second = (time % 60).toFixed(fixed)
  const minute = (Math.trunc(time / 60) % 60).toString()
  const hour = Math.trunc(time / 3600).toString()
  const secondTotalLength = fixed === 0 ? 2 : 3 + fixed
  if (hour === '0') {
    return `${minute.padStart(2, '0')}:${second.padStart(secondTotalLength, '0')}`
  }
  return `${hour}:${minute.padStart(2, '0')}:${second.padStart(secondTotalLength, '0')}`
}
export const parseCount = (countText: string | number) => {
  if (typeof countText === 'number') {
    return countText
  }
  const unit = (() => {
    if (countText.match(/亿$/)) {
      return 1e8
    }
    if (countText.match(/万$/)) {
      return 1e4
    }
    return 1
  })()
  return parseFloat(countText) * unit
}
const formatCountData = (count: number | string) => {
  if (typeof count === 'string') {
    count = parseInt(count)
  }
  if (count >= 1e8) {
    return {
      number: (Math.round(count / 1e7) / 10).toString(),
      unit: '亿',
    }
  }
  if (count >= 1e7) {
    return {
      number: Math.round(count / 1e4).toString(),
      unit: '万',
    }
  }
  if (count >= 1e4) {
    return {
      number: (Math.round(count / 1e3) / 10).toString(),
      unit: '万',
    }
  }
  return {
    number: count.toString(),
    unit: '',
  }
}
/** 格式化数量, 单位取值为万或亿, 小于1万时无单位, 有单位时保留1位小数
 * @param count 数量
 * @param minLength 数字部分的最短长度, 不足时用 `0` 补齐
 */
export const formatCount = (count: number | string, minLength = 0) => {
  if (count === undefined || count === null) {
    return '0'
  }
  const { number, unit } = formatCountData(count)
  return `${number.padStart(minLength, '0')}${unit}`
}
/**
 * 根据总量给当前数字添加前缀 `0`, 方便排序
 * @param number 数字
 * @param total 总量
 */
export const formatNumber = (number: number, total: number) => {
  if (Number.isNaN(number)) {
    return null
  }
  const length = Math.log10(total) + 1
  const numberText = number.toString()
  const decimalLength = numberText.length - Math.trunc(number).toString().length
  return numberText.padStart(length + decimalLength, '0')
}
/**
 * 格式化日期为`YYYY-MM-DD`
 * @param date 日期对象
 */
export const formatDate = (date: Date) =>
  `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date
    .getDate()
    .toString()
    .padStart(2, '0')}`
/**
 * 格式化时间为`HH:mm:ss`
 * @param date 日期对象
 */
export const formatTime = (date: Date) =>
  `${date.getHours().toString().padStart(2, '0')}:${date
    .getMinutes()
    .toString()
    .padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
/**
 * 格式化时间为`YYYY-MM-DD HH:mm:ss`
 * @param date 日期对象
 */
export const formatDateTime = (date: Date) => `${formatDate(date)} ${formatTime(date)}`
/** 格式化文件名, 过滤掉 Windows 不允许的字符
 * @param filename 文件名
 * @param replacement 填充字符, 被过滤掉的字符将用此填充字符替代, 默认为空
 */
export const formatFilename = (filename: string, replacement = '') =>
  filename.replace(/[\/\\:\*\?"<>\|]/g, replacement)
