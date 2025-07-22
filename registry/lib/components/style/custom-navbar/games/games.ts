import { CustomNavbarItemInit } from '../custom-navbar-item'

export const games: CustomNavbarItemInit = {
  name: 'games',
  displayName: '游戏中心',
  content: '游戏中心',

  touch: true,
  href: 'https://game.bilibili.com/',

  boundingWidth: 420,
  noPopupPadding: true,
  popupContent: () => import('./GamesPopup.vue').then(m => m.default),
}
