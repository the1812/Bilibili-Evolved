import { CustomNavbarItemInit } from '../custom-navbar-item'

export const watchlater: CustomNavbarItemInit = {
  name: 'watchlater',
  displayName: '稍后再看',
  content: '稍后再看',

  href: 'https://www.bilibili.com/watchlater/#/list',
  touch: true,
  active: document.URL.startsWith('https://www.bilibili.com/watchlater/'),
  loginRequired: true,

  boundingWidth: 380,
  noPopupPadding: true,
  popupContent: () => import('./NavbarWatchlater.vue').then(m => m.default),
}
