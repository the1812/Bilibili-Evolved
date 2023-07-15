import { CustomNavbarItemInit } from '../custom-navbar-item'

export interface NavbarIframeConfig {
  src: string
  href: string
  width: number
  height: number
  lazy: boolean
  displayName: string
  iframeName: string
}
const getIframeItem = (config: NavbarIframeConfig): CustomNavbarItemInit & NavbarIframeConfig => ({
  ...config,
  name: `${config.iframeName}Iframe`,
  content: config.displayName,

  touch: true,

  popupContent: () => import('./IframePopup.vue').then(m => m.default),
  boundingWidth: config.width,
  noPopupPadding: true,
  transparentPopup: true,
})
export const gamesIframe = getIframeItem({
  src: 'https://www.bilibili.com/page-proxy/game-nav.html',
  href: 'https://game.bilibili.com/',
  width: 680,
  height: 260,
  lazy: true,
  displayName: '游戏中心',
  iframeName: 'games',
})
export const livesIframe = getIframeItem({
  src: 'https://live.bilibili.com/blackboard/dropdown-menu.html',
  href: 'https://live.bilibili.com',
  width: 528,
  height: 266,
  lazy: true,
  displayName: '直播',
  iframeName: 'lives',
})
export const mangaIframe = getIframeItem({
  src: 'https://manga.bilibili.com/eden/bilibili-nav-panel.html',
  href: 'https://manga.bilibili.com',
  width: 720,
  height: 266,
  lazy: true,
  displayName: '漫画',
  iframeName: 'manga',
})
