import { getUID } from '@/core/utils'
import { CustomNavbarItemInit } from '../custom-navbar-item'

const href = `https://space.bilibili.com/${getUID()}/favlist`
export const favorites: CustomNavbarItemInit = {
  name: 'favorites',
  displayName: '收藏',
  content: '收藏',

  href,
  touch: true,
  active: document.URL.replace(/\?.*$/, '') === href,
  loginRequired: true,

  boundingWidth: 380,
  noPopupPadding: true,
  popupContent: () => import('./NavbarFavorites.vue').then(m => m.default),
}
