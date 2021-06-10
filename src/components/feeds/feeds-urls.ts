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
