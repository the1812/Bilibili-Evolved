import { defineAsyncComponent } from 'vue'
import type { CustomNavbarItemInit } from '../custom-navbar-item'

export const logo: CustomNavbarItemInit = {
  name: 'logo',
  displayName: 'Logo',
  content: defineAsyncComponent(() => import('./NavbarLogo.vue')),

  href: 'https://www.bilibili.com/',
}
