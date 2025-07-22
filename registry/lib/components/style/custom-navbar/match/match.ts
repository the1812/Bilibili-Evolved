import { CustomNavbarItemInit } from '../custom-navbar-item'

export const match: CustomNavbarItemInit = {
  name: 'match',
  displayName: '赛事',
  content: '赛事',

  touch: true,
  href: 'https://www.bilibili.com/v/game/match/',

  boundingWidth: 650,
  noPopupPadding: true,
  popupContent: () => import('./MatchPopup.vue').then(m => m.default),
}
