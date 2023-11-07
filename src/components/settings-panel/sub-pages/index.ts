import type { Component } from 'vue'
import { defineAsyncComponent } from 'vue'

export interface SubPage {
  name: string
  displayName: string
  component: Component
  icon: string
}
export const subPages: SubPage[] = [
  {
    name: 'userComponentsManage',
    displayName: '组件',
    component: defineAsyncComponent(() => import('./UserComponentsPage.vue')),
    icon: 'mdi-cube-scan',
  },
  {
    name: 'userPluginsManage',
    displayName: '插件',
    component: defineAsyncComponent(() => import('./UserPluginsPage.vue')),
    icon: 'mdi-puzzle-outline',
  },
  {
    name: 'customStylesManage',
    displayName: '样式',
    component: defineAsyncComponent(() => import('./UserStylesPage.vue')),
    icon: 'mdi-tune',
  },
  {
    name: 'about',
    displayName: '关于',
    component: defineAsyncComponent(() => import('./AboutPage.vue')),
    icon: 'mdi-information-outline',
  },
]
