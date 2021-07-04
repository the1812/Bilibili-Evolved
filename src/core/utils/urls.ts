export const watchlaterUrls = [
  '//www.bilibili.com/medialist/play/watchlater/',
]
export const favoriteListUrls = [
  '//www.bilibili.com/medialist/play/ml',
]
export const mediaListUrls = [
  ...watchlaterUrls,
  ...favoriteListUrls,
]
export const videoUrls = [
  '//www.bilibili.com/video/',
  ...mediaListUrls,
]
export const bangumiUrls = [
  '//www.bilibili.com/bangumi/',
]
export const cheeseUrls = [
  '//www.bilibili.com/cheese/',
]
export const videoAndBangumiUrls = [
  ...videoUrls,
  ...bangumiUrls,
]
export const mainSiteUrls = [
  'https://www.bilibili.com/v/',
  /^https:\/\/www\.bilibili\.com\/$/,
  /^https:\/\/www\.bilibili\.com\/index.html$/,
]
export const liveUrls = [
  /^https:\/\/live\.bilibili\.com\/(blanc\/)?[\d]+/,
]
export const darkExcludes = [
  '//member.bilibili.com/v2',
  '//member.bilibili.com/video/upload.html',
  '//member.bilibili.com/article-text/home',
  '//www.bilibili.com/audio/submit/',
  '//member.bilibili.com/studio/bs-editor/projects',
  '//www.bilibili.com/s/video/',
]
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
]
export const playerUrls = [
  '//player.bilibili.com',
  '//www.bilibili.com/html/player.html',
  ...videoUrls,
  ...bangumiUrls,
  ...cheeseUrls,
]
