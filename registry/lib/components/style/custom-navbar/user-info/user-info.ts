import { getUID } from '@/core/utils'
import { CustomNavbarItemInit } from '../custom-navbar-item'

export const userInfo: CustomNavbarItemInit = {
  name: 'userInfo',
  displayName: '个人信息',
  content: () => import('./UserFace.vue').then(m => m.default),

  href: getUID() ? 'https://space.bilibili.com' : null,
  touch: true,

  popupContent: () => import('./UserInfoPopup.vue').then(m => m.default),
  lazy: false,
  noPopupPadding: true,
  boundingWidth: 240,
}
