import { PluginMetadata } from '@/plugins/plugin'
import { CustomNavbarItemInit } from '../../../components/style/custom-navbar/custom-navbar-item'

const updateHostCookie = (targetMode: string) => {
  cookieStore.set({
    name: 'theme_style',
    value: targetMode,
    path: '/',
    expires: Date.now() + 365 * 24 * 60 * 60 * 1000,
    domain: 'bilibili.com',
  })
}

export const plugin: PluginMetadata = {
  name: 'customNavbar.items.integratedDarkMode',
  displayName: '自定义顶栏 - 深色模式开关',
  description:
    '为自定义顶栏添加一个深色模式开关, 方便快速切换深色模式. (请注意和夜间模式区分; 受限于 b 站深色模式实现, 这个开关无法实时切换, 会刷新页面)',
  async setup({ addData }) {
    addData('customNavbar.items', (items: CustomNavbarItemInit[]) => {
      items.push({
        name: 'integratedDarkMode',
        displayName: '深色模式开关',
        content: () => import('./NavbarIntegratedDarkMode.vue'),

        clickAction: async () => {
          const currentMode = (await cookieStore.get('theme_style'))?.value ?? 'light'
          const targetMode = currentMode === 'dark' ? 'light' : 'dark'
          updateHostCookie(targetMode)
          location.reload()
        },
      })
    })
  },
}
