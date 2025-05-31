/**
 * 如果成功从参数 url 中捕获到直播间号，那么返回原版直播间页面链接，否则返回参数 url
 * @param url 直播间页面链接
 */
export const getOriginalLiveroomUrl = (url: string): string => {
  const match = url.match(/^https:\/\/live\.bilibili\.com\/([\d]+)/)
  return match ? `https://live.bilibili.com/blanc/${match[1]}` : url
}
