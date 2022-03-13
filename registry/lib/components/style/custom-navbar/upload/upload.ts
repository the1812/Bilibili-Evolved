import { CustomNavbarItemInit } from '../custom-navbar-item'

export const upload: CustomNavbarItemInit = {
  name: 'upload',
  displayName: '投稿',
  content: () => import('./NavbarUpload.vue').then(m => m.default),

  touch: true,
  href: 'https://member.bilibili.com/platform/upload/video/frame',

  popupContent: () => import('./UploadPopup.vue').then(m => m.default),
}
