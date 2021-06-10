import { Executable, VueModule } from '@/core/common-types'

export interface SubPage {
  name: string
  displayName: string
  component: Executable<VueModule>
  icon: string
}
export const subPages: SubPage[] = [
  {
    name: 'userComponentsManage',
    displayName: '组件',
    component: () => import('./UserComponentsPage.vue').then(m => m.default),
    icon: 'mdi-cube-scan',
  },
  {
    name: 'userPluginsManage',
    displayName: '插件',
    component: () => import('./UserPluginsPage.vue').then(m => m.default),
    icon: 'mdi-puzzle-outline',
  },
  {
    name: 'customStylesManage',
    displayName: '样式',
    component: () => import('./UserStylesPage.vue').then(m => m.default),
    icon: 'mdi-tune',
  },
  {
    name: 'about',
    displayName: '关于',
    component: () => import('./AboutPage.vue').then(m => m.default),
    icon: 'mdi-information-outline',
  },
]
