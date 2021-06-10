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
  href: 'https://www.bilibili.com/ranking',
})
export const drawing = getSimpleLinkItem({
  name: 'drawing',
  displayName: '相簿',
  href: 'https://h.bilibili.com',
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
export const manga = getSimpleLinkItem({
  name: 'manga',
  displayName: '漫画',
  href: 'https://manga.bilibili.com',
})
