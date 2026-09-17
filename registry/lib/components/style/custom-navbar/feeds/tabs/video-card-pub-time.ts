/** 顶栏动态页签卡片上的发布时间显示, 用于视频卡片(`VideoCard`)的数据源 */

/** 详细发布时间: 同一年的省略年份 */
export const formatPubTime = (pubTime: number) => {
  const now = Number(new Date())
  const pubDate = new Date(pubTime)
  const time = [pubDate.getHours(), pubDate.getMinutes(), pubDate.getSeconds()]
    .map(it => it.toString().padStart(2, '0'))
    .join(':')
  let date: number[]
  if (new Date(now).getFullYear() !== pubDate.getFullYear()) {
    date = [pubDate.getFullYear(), pubDate.getMonth() + 1, pubDate.getDate()]
  } else {
    date = [pubDate.getMonth() + 1, pubDate.getDate()]
  }
  return `${date.map(it => it.toString().padStart(2, '0')).join('-')} ${time}`
}
/** 简短发布时间: 一天内显示`刚刚`/`N分钟前`/`N小时前`, 更早显示日期(同一年的省略年份) */
export const formatPubTimeText = (pubTime: number) => {
  const now = Number(new Date())
  const oneDayBefore = now - 1000 * 3600 * 24
  if (oneDayBefore < pubTime) {
    const diffHours = Math.round((now - pubTime) / 1000 / 3600)
    if (diffHours === 0) {
      const diffMinutes = Math.round((now - pubTime) / 1000 / 60)
      if (diffMinutes === 0) {
        return '刚刚'
      }
      return `${diffMinutes}分钟前`
    }
    return `${diffHours}小时前`
  }
  const pubDate = new Date(pubTime)
  let date: number[]
  if (new Date(now).getFullYear() !== pubDate.getFullYear()) {
    date = [pubDate.getFullYear(), pubDate.getMonth() + 1, pubDate.getDate()]
  } else {
    date = [pubDate.getMonth() + 1, pubDate.getDate()]
  }
  return `${date.map(it => it.toString().padStart(2, '0')).join('-')}`
}
