import { CustomNavbarItemInit } from '../custom-navbar-item'

export const home: CustomNavbarItemInit = {
  name: 'home',
  displayName: '主站',
  content: '主站',

  href: 'https://www.bilibili.com/',
  touch: true,

  boundingWidth: 366,
  popupContent: () => import('./NavbarHome.vue').then(m => m.default),
}
