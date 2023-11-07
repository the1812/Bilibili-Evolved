import { defineAsyncComponent } from 'vue'
import type { CustomNavbarItemInit } from '../custom-navbar-item'

export const search: CustomNavbarItemInit = {
  name: 'search',
  displayName: '搜索',
  content: defineAsyncComponent(() => import('./NavbarSearch.vue')),

  // 禁用元素本身的 hover 效果之类的, 作为 content 的 NavbarSearch 是依然能够响应的
  disabled: true,
}
