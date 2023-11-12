import { matchUrlPattern } from '.'
import { TestPattern } from '../common-types'

/** 稍后再看页面 */
export const watchlaterUrls = [
  '//www.bilibili.com/medialist/play/watchlater',
  '//www.bilibili.com/list/watchlater',
]
/** 收藏夹连播页面 */
export const favoriteListUrls = [
  '//www.bilibili.com/medialist/play/ml',
  '//www.bilibili.com/list/ml',
]
/** UP 主视频连播页面 */
export const upListUrls = [
  /\/\/www\.bilibili\.com\/medialist\/play\/\d+/,
  /\/\/www\.bilibili\.com\/list\/\d+/,
]
/** 合集类页面 */
export const mediaListUrls = [
  ...watchlaterUrls,
  ...favoriteListUrls,
  ...upListUrls,
  /\/\/www\.bilibili\.com\/list\//,
]
/** 拜年纪等类似活动页面 */
export const festivalUrls = [/\/\/www\.bilibili\.com\/festival\//]
/** 含有普通视频的页面 */
export const videoUrls = ['//www.bilibili.com/video/', ...festivalUrls, ...mediaListUrls]
/** 含有番剧的页面 */
export const bangumiUrls = ['//www.bilibili.com/bangumi/play/']
/** 含有课程的页面 */
export const cheeseUrls = ['//www.bilibili.com/cheese/']
/** 视频和番剧页面 */
export const videoAndBangumiUrls = [...videoUrls, ...bangumiUrls]
/** 含有所有类型视频(包括番剧和课程)的页面 */
export const allVideoUrls = [...videoAndBangumiUrls, ...cheeseUrls]
/** 主站及各分区页面 */
export const mainSiteUrls = [
  'https://www.bilibili.com/v/',
  /^https:\/\/www\.bilibili\.com\/$/,
  /^https:\/\/www\.bilibili\.com\/([^\/]+)\.html$/,
  /^https:\/\/www\.bilibili\.com\/watchlater\/#\/list$/,
  'https://www.bilibili.com/account/',
]
/** 直播间页面 */
export const liveUrls = [/^https:\/\/live\.bilibili\.com\/(blanc\/)?[\d]+/]
/** 除动态详情页以外的含有动态的页面 */
export const feedsUrlsWithoutDetail = [
  /^https:\/\/t\.bilibili\.com\/$/,
  /^https:\/\/space\.bilibili\.com\//,
  /^https:\/\/live\.bilibili\.com\/(blanc\/)?[\d]+/,
]
/** 含有动态的页面 */
export const feedsUrls = [
  ...feedsUrlsWithoutDetail,
  /^https:\/\/t\.bilibili\.com\//,
  /^https:\/\/www\.bilibili\.com\/opus\/[\d]+$/,
]
/** 含有专栏的页面 */
export const columnUrls = [/^https:\/\/www\.bilibili\.com\/read\/cv/]
/** 含有播放器的页面 */
export const playerUrls = [
  '//player.bilibili.com',
  '//www.bilibili.com/html/player.html',
  ...videoUrls,
  ...bangumiUrls,
  ...cheeseUrls,
]
/**
 * 测试当前页面网址是否符合传入的 URL 匹配列表
 * @param urlLists URL 匹配列表
 */
export const matchCurrentPage = (...urlLists: TestPattern[] | TestPattern) =>
  urlLists.some((list: TestPattern | string | RegExp) => {
    if (Array.isArray(list)) {
      return list.some(url => matchUrlPattern(url))
    }
    return matchUrlPattern(list)
  })
