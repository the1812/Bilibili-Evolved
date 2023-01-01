import { CustomNavbarItemInit } from '../custom-navbar-item'

const href = 'https://www.bilibili.com/account/history'
export const history: CustomNavbarItemInit = {
  name: 'history',
  displayName: '历史',
  content: '历史',

  href,
  touch: true,
  active: document.URL.replace(/\?.*$/, '') === href,
  loginRequired: true,

  boundingWidth: 400,
  noPopupPadding: true,
  popupContent: () => import('./NavbarHistory.vue').then(m => m.default),
}
