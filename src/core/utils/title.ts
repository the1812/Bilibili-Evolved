import { dq } from '../utils'
import { getGeneralSettings } from '../settings'

type StringMap = {
  [key: string]: string | undefined | null
}
export const formatTitle = (
  format: string,
  includesPageTitle = true,
  extraData: StringMap = {},
) => {
  const now = new Date()
  const data: StringMap = {
    title: document.title
      .replace(/：([^：]+?)_.+?_bilibili_哔哩哔哩$/, '')
      .replace(/_哔哩哔哩_bilibili$/, '')
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
    lid: document.URL.replace(/https:\/\/live\.bilibili\.com\/(\d+).*/, '$1'),
    // 年月日这方法名真够乱的
    y: now.getFullYear().toString(),
    M: (now.getMonth() + 1).toString().padStart(2, '0'), // zero-based
    d: now.getDate().toString().padStart(2, '0'),
    h: now.getHours().toString().padStart(2, '0'),
    m: now.getMinutes().toString().padStart(2, '0'),
    s: now.getSeconds().toString().padStart(2, '0'),
    ms: now.getMilliseconds().toString().substr(0, 3),
  }
  Object.assign(data, extraData)
  const filename = Object.keys(data).reduce((result, name) => result.replace(
    new RegExp(`\\[([^\\[\\]]*?)${name}([^\\[\\]]*?)\\]`, 'g'),
    data[name] ? `$1${data[name]}$2` : '',
  ), format)
  return filename.replace(/[\/\\:\*\?"<>\|]/g, ' ')
}
export const getFriendlyTitle = (includesPageTitle = true, extraData: StringMap = {}) => (
  formatTitle(getGeneralSettings().filenameFormat, includesPageTitle, extraData)
)
