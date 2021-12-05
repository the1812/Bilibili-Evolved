import { PluginMetadata } from '@/plugins/plugin'
import { CustomNavbarItemInit } from '../../../components/style/custom-navbar/custom-navbar-item'

export const plugin: PluginMetadata = {
  name: 'customNavbar.items.darkMode',
  displayName: '自定义顶栏 - 夜间模式开关',
  description: '为自定义顶栏添加一个夜间模式开关, 方便快速切换夜间模式.',
  async setup({ addData }) {
    const { getComponentSettings } = await import('@/core/settings')
    addData('customNavbar.items', (items: CustomNavbarItemInit[]) => {
      items.push({
        name: 'darkMode',
        displayName: '夜间开关',
        content: () => import('./NavbarDarkMode.vue'),

        clickAction: () => {
          const settings = getComponentSettings('darkMode')
          settings.enabled = !settings.enabled
        },
      })
    })
  },
}
