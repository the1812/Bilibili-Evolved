import { toggleStyle } from '@/components/styled-component'
import { defineComponentMetadata } from '@/components/define'
import { playerAgent } from '@/components/video/player-agent'
import { DanmakuRecord, forEachVideoDanmaku } from '@/components/video/video-danmaku'
import { videoChange } from '@/core/observer'
import { playerUrls } from '@/core/utils/urls'

const cnChars = '零一二三四五六七八九'.split('')
// 优先匹配带显式分隔符的时间写法, 兼容冒号/句号/逗号及中文单位.
const separatedAirborneRegex =
  /([\d零一二三四五六七八九十]+)\s*(小时|[:：时分.,。，,])\s*([\d零一二三四五六七八九十]+)(?:\s*([:：分.,。，,])\s*([\d零一二三四五六七八九十]+))?/
// 紧凑数字仅处理 3~4 位, 统一按 分秒 解析, 避免把更长数字串拆出误判.
const compactAirborneRegex = /\d{3,4}/g
// B 站常见大笑弹幕, 不应被识别为空降时间.
const compactAirborneBlacklist = new Set(['233', '2333'])
const danmakuClassTokens = ['b-danmaku', 'bili-dm', 'bili-danmaku-x-dm']
const decimalLikeSeparators = new Set(['.', '。', ',', '，'])
// 候选时间若紧跟数值/计量/金额语境后缀, 大概率不是空降时间.
const countLikeSuffixRegex = /^(?:\s)*(?:[%％+＋]|[wWkK万千百亿人位名个赞倍元])/
// 年份/序号语境里的数字更像编号而不是时间, 如 “2025的第一波”.
const yearLikeSuffixRegex = /^(?:\s)*(?:年|的第|年第|波|批)/

const parseNumber = (text: string | null) => {
  if (!text) {
    return NaN
  }
  const parts = text.split('十')
  if (parts.length === 1) {
    const converted = text.replace(/[零一二三四五六七八九]/g, char => {
      return `${cnChars.indexOf(char)}`
    })
    return parseInt(converted)
  }
  if (parts.length === 2) {
    const first = parts[0] === '' ? 1 : cnChars.indexOf(parts[0])
    const second = parts[1] === '' ? 0 : cnChars.indexOf(parts[1])
    if (first === -1 || second === -1) {
      return NaN
    }
    return first * 10 + second
  }

  return NaN
}
const hasCountLikeSuffix = (text: string, endIndex: number) => {
  return countLikeSuffixRegex.test(text.slice(endIndex, endIndex + 4))
}
const hasYearLikeSuffix = (text: string, endIndex: number) => {
  return yearLikeSuffixRegex.test(text.slice(endIndex, endIndex + 3))
}
const hasAlphabetAdjacent = (text: string, startIndex: number, endIndex: number) => {
  return /[A-Za-z]/.test(text[startIndex - 1] ?? '') || /[A-Za-z]/.test(text[endIndex] ?? '')
}
const getSeparatedAirborneTime = (text: string) => {
  const airborneMatch = separatedAirborneRegex.exec(text)
  if (!airborneMatch) {
    return NaN
  }
  const [, firstText, firstSeparator, secondText, secondSeparator, thirdText] = airborneMatch
  const endIndex = airborneMatch.index + airborneMatch[0].length
  if (hasCountLikeSuffix(text, endIndex)) {
    return NaN
  }
  // 句号/逗号一类更像小数写法, 仅接受两位秒数, 降低 “3.9万人+” 这类误判.
  if (
    decimalLikeSeparators.has(firstSeparator) &&
    (!thirdText ? secondText.length !== 2 : secondText.length !== 2 || thirdText.length !== 2)
  ) {
    return NaN
  }
  if (thirdText) {
    if (decimalLikeSeparators.has(secondSeparator ?? '') && thirdText.length !== 2) {
      return NaN
    }
    const [hour, minute, second] = [firstText, secondText, thirdText].map(r => parseNumber(r))
    if ([hour, minute, second].some(v => Number.isNaN(v))) {
      return NaN
    }
    if (text.includes('分') && !text.includes('时')) {
      return NaN
    }
    return hour * 3600 + minute * 60 + second
  }
  const [minute, second] = [firstText, secondText].map(r => parseNumber(r))
  if ([minute, second].some(v => Number.isNaN(v))) {
    return NaN
  }
  return minute * 60 + second
}
const getCompactAirborneTime = (text: string) => {
  // 若文本里出现多个合法的紧凑分秒候选, 视为语义有歧义, 不做空降.
  compactAirborneRegex.lastIndex = 0
  let compactMatch = compactAirborneRegex.exec(text)
  let matchedTime: number | null = null
  while (compactMatch !== null) {
    const [raw] = compactMatch
    const start = compactMatch.index
    const end = start + raw.length
    // 只接受独立数字段, 避免在更长数字串中截出 3~4 位片段.
    if (/\d/.test(text[start - 1] ?? '') || /\d/.test(text[end] ?? '')) {
      compactMatch = compactAirborneRegex.exec(text)
      continue
    }
    if (compactAirborneBlacklist.has(raw)) {
      compactMatch = compactAirborneRegex.exec(text)
      continue
    }
    // 型号/编号经常表现为数字紧邻字母, 如 “054A”, 这类通常不是时间.
    if (hasAlphabetAdjacent(text, start, end)) {
      compactMatch = compactAirborneRegex.exec(text)
      continue
    }
    if (hasCountLikeSuffix(text, end)) {
      compactMatch = compactAirborneRegex.exec(text)
      continue
    }
    if (hasYearLikeSuffix(text, end)) {
      compactMatch = compactAirborneRegex.exec(text)
      continue
    }
    const minute = parseInt(raw.slice(0, -2))
    const second = parseInt(raw.slice(-2))
    if (second < 60) {
      const time = minute * 60 + second
      if (matchedTime !== null) {
        return NaN
      }
      matchedTime = time
    }
    compactMatch = compactAirborneRegex.exec(text)
  }
  return matchedTime ?? NaN
}
const getAirborneTime = (text: string | null) => {
  if (!text) {
    return NaN
  }
  const separatedTime = getSeparatedAirborneTime(text)
  if (!Number.isNaN(separatedTime)) {
    return separatedTime
  }
  return getCompactAirborneTime(text)
}
const getDanmakuElementFromEventTarget = (target: HTMLElement | null) => {
  if (!target) {
    return null
  }
  if (danmakuClassTokens.some(token => target.classList.contains(token))) {
    return target
  }
  if (danmakuClassTokens.some(token => target.parentElement?.classList.contains(token))) {
    return target.parentElement
  }
  return null
}

export const component = defineComponentMetadata({
  displayName: '启用弹幕空降',
  author: {
    name: 'kdxcxs',
    link: 'https://github.com/kdxcxs',
  },
  description: {
    'zh-CN': '为可能含有时间点的弹幕添加下划线, 点击可以跳到视频对应时间.',
  },
  tags: [componentsTags.video],
  urlInclude: playerUrls,
  ...toggleStyle(
    'danmakuAirborne',
    () => import('./airborne.scss'),
    async ({ settings }) => {
      const { enabled } = settings
      const airborneHandler = (e: MouseEvent) => {
        if (!enabled) {
          return
        }
        const danmakuElement = getDanmakuElementFromEventTarget(e.target as HTMLElement | null)
        if (!danmakuElement) {
          return
        }
        const time = getAirborneTime(danmakuElement.textContent)
        if (!Number.isNaN(time)) {
          unsafeWindow.player.seek(time, false)
        }
      }
      const detectAirborne = (danmaku: DanmakuRecord) => {
        const canAirborne = !Number.isNaN(getAirborneTime(danmaku.text))
        danmaku.element.classList.toggle('airborne', canAirborne)
      }
      forEachVideoDanmaku({ added: detectAirborne })
      videoChange(async () => {
        const wrapper = (await playerAgent.query.video.wrap()) as HTMLElement
        if (wrapper.classList.contains('airborne-enabled')) {
          return
        }
        wrapper.classList.add('airborne-enabled')
        wrapper.addEventListener('click', airborneHandler)
      })
    },
  ),
})
