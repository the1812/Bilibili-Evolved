import { CustomNavbarItemInit } from '../custom-navbar-item'

interface SimpleLinkConfig {
  name: string
  displayName: string
  href: string
}
const getSimpleLinkItem = (config: SimpleLinkConfig): SimpleLinkConfig & CustomNavbarItemInit => ({
  ...config,
  content: config.displayName,

  active: document.URL.startsWith(config.href),
})
export const ranking = getSimpleLinkItem({
  name: 'ranking',
  displayName: '排行',
  href: 'https://www.bilibili.com/v/popular/rank/all',
})
export const bangumi = getSimpleLinkItem({
  name: 'bangumi',
  displayName: '番剧',
  href: 'https://www.bilibili.com/anime/',
})
export const music = getSimpleLinkItem({
  name: 'music',
  displayName: '音频',
  href: 'https://www.bilibili.com/audio/home/',
})
export const shop = getSimpleLinkItem({
  name: 'shop',
  displayName: '会员购',
  href: 'https://show.bilibili.com',
})
export const match = getSimpleLinkItem({
  name: 'match',
  displayName: '赛事',
  href: 'https://www.bilibili.com/v/game/match/',
})
export const creations = getSimpleLinkItem({
  name: 'creations',
  displayName: '创作中心',
  href: 'https://member.bilibili.com/platform/home',
})
