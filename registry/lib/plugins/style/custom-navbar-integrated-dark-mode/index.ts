import { PluginMetadata } from '@/plugins/plugin'
import { CustomNavbarItemInit } from '../../../components/style/custom-navbar/custom-navbar-item'
import {
  applyOfficialTheme,
  isPageDarkModeEnabled,
} from '../../../components/style/dark-mode/integrated/official-theme'

export const plugin: PluginMetadata = {
  name: 'customNavbar.items.integratedDarkMode',
  displayName: '自定义顶栏 - 深色模式开关',
  async setup({ addData }) {
    addData('customNavbar.items', (items: CustomNavbarItemInit[]) => {
      items.push({
        name: 'integratedDarkMode',
        displayName: '深色模式开关',
        content: () => import('./NavbarIntegratedDarkMode.vue'),
        clickAction: () => applyOfficialTheme(isPageDarkModeEnabled() ? 'light' : 'dark'),
      })
    })
  },
}
