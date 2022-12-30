import { CustomNavbarOptions } from 'registry/lib/components/style/custom-navbar'
import { PluginMetadata } from '@/plugins/plugin'
import { getComponentSettings } from '@/core/settings'
import type { CustomNavbarItemInit } from '../../../components/style/custom-navbar/custom-navbar-item'

export const plugin: PluginMetadata = {
  name: 'customNavbar.items.channel',
  displayName: '自定义顶栏 - 频道',
  description: '为自定义顶栏添加一个频道入口.',
  async setup({ addData }) {
    addData('customNavbar.items', (items: CustomNavbarItemInit[]) => {
      const defaultLink = 'https://www.bilibili.com/v/channel/'
      const name = 'channel'
      const isOpenInNewTab = () => {
        const { options } = getComponentSettings('customNavbar') as { options: CustomNavbarOptions }
        if (name in options.openInNewTabOverrides) {
          return options.openInNewTabOverrides[name]
        }
        return options.openInNewTab
      }
      items.push({
        name: 'channel',
        displayName: '频道',
        content: () => import('./NavbarChannel.vue'),
        clickAction: () => {
          const channelId = dq('.navbar-channel').getAttribute('data-channel-id')
          window.open(
            channelId ? `${defaultLink}${channelId}` : defaultLink,
            isOpenInNewTab() ? '_blank' : '_self',
          )
        },
      })
    })
  },
}
