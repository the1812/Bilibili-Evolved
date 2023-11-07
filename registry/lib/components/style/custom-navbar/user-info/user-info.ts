import { defineAsyncComponent } from 'vue'
import { getUID } from '@/core/utils'

import type { CustomNavbarItemInit } from '../custom-navbar-item'

export const userInfo: CustomNavbarItemInit = {
  name: 'userInfo',
  displayName: '个人信息',
  content: defineAsyncComponent(() => import('./UserFace.vue')),

  href: getUID() ? 'https://space.bilibili.com' : null,
  touch: true,

  popupContent: defineAsyncComponent(() => import('./UserInfoPopup.vue')),
  lazy: false,
  noPopupPadding: true,
  boundingWidth: 240,
}
