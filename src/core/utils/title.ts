import { dq } from '../utils'
import { getGeneralSettings } from '../settings'
import { formatFilename } from './formatters'
import { descendingSort } from './sort'

type StringMap = Record<string, string>
const tokenSplit = (format: string) => {
  let startIndex = 0
  let depth = 0
  const tokens: string[] = []
  format.split('').forEach((char, index) => {
    if (char === '[') {
      if (depth === 0) {
        tokens.push(format.substring(startIndex, index))
        startIndex = index
      } else {
        depth++
      }
    }
    if (char === ']') {
      if (depth === 0) {
        tokens.push(format.substring(startIndex, index + 1))
        startIndex = index + 1
      } else {
        depth--
      }
    }
  })
  if (startIndex < format.length) {
    tokens.push(format.substring(startIndex))
  }
  return tokens.filter(it => it !== '')
}

export const getTitleVariablesFromDate = (date: Date, padStartLength = 2) => {
  return {
    year: date.getFullYear().toString(),
    month: (date.getMonth() + 1).toString().padStart(padStartLength, '0'),
    day: date.getDate().toString().padStart(padStartLength, '0'),
    hour: date.getHours().toString().padStart(padStartLength, '0'),
    minute: date.getMinutes().toString().padStart(padStartLength, '0'),
    second: date.getSeconds().toString().padStart(padStartLength, '0'),
    millisecond: date.getMilliseconds().toString().substring(0, 3),
  }
}

export const formatTitle = (
  format: string,
  includesPageTitle = true,
  extraVariables: StringMap = {},
) => {
  const getLegacyTitle = () => {
    return (
      document.title
        .replace(
          /第[0-9]*[零一二三四五六七八九十百千]*[集话]-[^-]+-[^-]+-[^-]+在线观看-bilibili-哔哩哔哩$/,
          '',
        )
        .replace(/-[^-]+-[^-]+-[^-]+在线观看-bilibili-哔哩哔哩$/, '')
        .replace(/-[^-]+-[^-]+在线观看-bilibili-哔哩哔哩$/, '')
        .replace(/：([^：]+?)_.+?_bilibili_哔哩哔哩$/, '')
        .replace(/_哔哩哔哩_bilibili$/, '')
        .replace(/ - 哔哩哔哩$/, '')
        // b站不再有干杯了吗...
        .replace(/_哔哩哔哩 \(゜-゜\)つロ 干杯~-bilibili$/, '')
        .replace(/(.*?) - (.*?) - 哔哩哔哩直播，二次元弹幕直播平台$/, '$1')
        .trim()
    )
  }
  const dateVariables = getTitleVariablesFromDate(new Date())
  const builtInVariables: StringMap = {
    title: (() => {
      const videoPageTitle = dq('.video-info-container .video-title')
      if (videoPageTitle !== null) {
        return videoPageTitle.getAttribute('title')
      }
      const bangumiPageTitle = dq('[class*="mediainfo_mediaTitle"]')
      if (bangumiPageTitle !== null) {
        return bangumiPageTitle.getAttribute('title')
      }
      const livePageTitle = dq('.header-info-ctnr .live-title .text')
      if (livePageTitle !== null) {
        return livePageTitle.getAttribute('title')
      }
      return getLegacyTitle()
    })(),
    ep: (() => {
      if (!includesPageTitle) {
        return undefined
      }
      const bangumiPageEp = dq('#eplist_module li.cursor .ep-title') as HTMLElement
      if (bangumiPageEp !== null) {
        return bangumiPageEp.innerText
      }
      const videoPageEp = dq(
        '#multi_page .cur-list>ul li.on a, .video-episode-card__info-playing .video-episode-card__info-title',
      )
      if (videoPageEp !== null) {
        return videoPageEp.getAttribute('title')
      }
      const watchlaterPageEp = dq('.multip-list-item.multip-list-item-active')
      if (watchlaterPageEp !== null) {
        return watchlaterPageEp.getAttribute('title')
      }
      return undefined
    })(),
    aid: unsafeWindow.aid,
    bvid: unsafeWindow.bvid,
    cid: unsafeWindow.cid,
    lid: document.URL.replace(/https:\/\/live\.bilibili\.com\/(blanc\/)?([\d]+)/, '$2'),
    y: dateVariables.year,
    M: dateVariables.month,
    d: dateVariables.day,
    h: dateVariables.hour,
    m: dateVariables.minute,
    s: dateVariables.second,
    ms: dateVariables.millisecond,
  }
  const variables = {
    ...builtInVariables,
    ...extraVariables,
  }
  const tokens = tokenSplit(format)
  const sortedVariables = Object.entries(variables).sort(descendingSort(([name]) => name.length))
  const processedTokens = tokens.map(token => {
    if (!token.startsWith('[') || !token.endsWith(']')) {
      return token
    }
    for (const [name, value] of sortedVariables) {
      const regex = new RegExp(`^\\[([^\\[\\]]*?)${name}([^\\[\\]]*?)\\]$`)
      const match = token.match(regex)
      if (match && Boolean(value)) {
        return `${match[1] ?? ''}${value}${match[2] ?? ''}`
      }
    }
    return ''
  })
  const finalTitle = processedTokens.join('')
  return formatFilename(finalTitle, ' ')
}
export const getFriendlyTitle = (includesPageTitle = true, extraVariables: StringMap = {}) =>
  formatTitle(getGeneralSettings().filenameFormat, includesPageTitle, extraVariables)
