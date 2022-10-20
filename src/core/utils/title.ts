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
export const formatTitle = (
  format: string,
  includesPageTitle = true,
  extraVariables: StringMap = {},
) => {
  const now = new Date()
  const builtInVariables: StringMap = {
    title: document.title
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
      .trim(),
    ep: (() => {
      if (!includesPageTitle) {
        return undefined
      }
      const bangumiPage = dq('#eplist_module li.cursor .ep-title') as HTMLElement
      if (bangumiPage !== null) {
        return bangumiPage.innerText
      }
      const pageLink = dq('#multi_page .cur-list>ul li.on a')
      if (pageLink !== null) {
        return pageLink.getAttribute('title')
      }
      return undefined
    })(),
    aid: unsafeWindow.aid,
    bvid: unsafeWindow.bvid,
    cid: unsafeWindow.cid,
    lid: document.URL.replace(/https:\/\/live\.bilibili\.com\/(blanc\/)?(\d)+/, '$2'),
    // 年月日这方法名真够乱的
    y: now.getFullYear().toString(),
    M: (now.getMonth() + 1).toString().padStart(2, '0'), // zero-based
    d: now.getDate().toString().padStart(2, '0'),
    h: now.getHours().toString().padStart(2, '0'),
    m: now.getMinutes().toString().padStart(2, '0'),
    s: now.getSeconds().toString().padStart(2, '0'),
    ms: now.getMilliseconds().toString().substring(0, 3),
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
