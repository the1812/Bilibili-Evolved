import { defineAsyncComponent } from 'vue'
import { getUID } from '@/core/utils'

import type { CustomNavbarItemInit } from '../custom-navbar-item'

export enum SubscriptionTypes {
  Bangumi = 'bangumi',
  Cinema = 'cinema',
}
const uid = getUID()
export const subscriptions: CustomNavbarItemInit = {
  name: 'subscriptions',
  displayName: '番剧 (弹窗)',
  content: () => import('./Content.vue').then(m => m.default),

  href: `https://space.bilibili.com/${uid}/bangumi`,
  touch: true,
  active: [
    `https://space.bilibili.com/${uid}/bangumi`,
    `https://space.bilibili.com/${uid}/cinema`,
    `https://space.bilibili.com/${uid}/subs`,
  ].includes(document.URL.replace(/\?.*$/, '')),
  loginRequired: true,

  boundingWidth: 380,
  noPopupPadding: true,
  popupContent: defineAsyncComponent(() => import('./NavbarSubscriptions.vue')),
}
