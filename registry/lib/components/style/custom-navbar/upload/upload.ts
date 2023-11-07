import { defineAsyncComponent } from 'vue'
import type { CustomNavbarItemInit } from '../custom-navbar-item'

export const upload: CustomNavbarItemInit = {
  name: 'upload',
  displayName: '投稿',
  content: defineAsyncComponent(() => import('./NavbarUpload.vue')),

  touch: true,
  href: 'https://member.bilibili.com/platform/upload/video/frame',

  popupContent: defineAsyncComponent(() => import('./UploadPopup.vue')),
}
