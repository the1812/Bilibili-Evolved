import { PluginMetadata } from '@/plugins/plugin'
import { CustomNavbarItemInit } from '../../../components/style/custom-navbar/custom-navbar-item'

export const plugin: PluginMetadata = {
  name: 'customNavbar.items.darkMode',
  displayName: '自定义顶栏 - 夜间模式开关',
  description: '为自定义顶栏添加夜间模式开关, 方便快速切换夜间模式, 也支持添加官方的深色模式开关.',
  async setup({ addData }) {
    const { getComponentSettings } = await import('@/core/settings')
    addData('customNavbar.items', (items: CustomNavbarItemInit[]) => {
      items.push(
        {
          name: 'darkMode',
          displayName: '夜间开关',
          content: () => import('./NavbarDarkMode.vue'),

          clickAction: () => {
            const settings = getComponentSettings('darkMode')
            settings.enabled = !settings.enabled
          },
        },
        {
          name: 'integratedDarkMode',
          displayName: '深色模式开关',
          content: () => import('./NavbarIntegratedDarkMode.vue'),
          clickAction: async () => {
            const currentTheme = await cookieStore.get('theme_style')
            const newTheme = currentTheme?.value === 'dark' ? 'light' : 'dark'
            await cookieStore.set({
              name: 'theme_style',
              value: newTheme,
              domain: 'bilibili.com',
              expires: Number(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
            })
            location.reload()
          },
        },
      )
    })
  },
}
