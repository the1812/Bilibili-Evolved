import { CustomNavbarItemInit } from '../custom-navbar-item'

export const logo: CustomNavbarItemInit = {
  name: 'logo',
  displayName: 'Logo',
  content: () => import('./NavbarLogo.vue').then(m => m.default),

  href: 'https://www.bilibili.com/',
}
