import { getUID } from '@/core/utils'
import { CustomNavbarItemInit } from '../custom-navbar-item'

export enum SubscriptionTypes {
  Bangumi = 'bangumi',
  Cinema = 'cinema',
}
const uid = getUID()
export const subscriptions: CustomNavbarItemInit = {
  name: 'subscriptions',
  displayName: '番剧',
  content: '番剧',

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
  popupContent: () => import('./NavbarSubscriptions.vue').then(m => m.default),
}
