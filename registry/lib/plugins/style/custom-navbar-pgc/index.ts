import { PluginMetadata } from '@/plugins/plugin'
import type { CustomNavbarItemInit } from '../../../components/style/custom-navbar/custom-navbar-item'

export const plugin: PluginMetadata = {
  name: 'customNavbar.items.pgc',
  displayName: '自定义顶栏 - 版权内容',
  description: '为自定义顶栏扩充版权内容相关的快速入口, 包括国创 / 电影 / 电视剧 /综艺 / 纪录片',
  async setup({ addData }) {
    addData('customNavbar.items', (items: CustomNavbarItemInit[]) => {
      const pgcItems = [
        {
          name: 'guochuang',
          displayName: '国创',
          href: 'https://www.bilibili.com/guochuang/',
        },
        {
          name: 'movie',
          displayName: '电影',
          href: 'https://www.bilibili.com/movie/',
        },
        {
          name: 'tv',
          displayName: '电视剧',
          href: 'https://www.bilibili.com/tv/',
        },
        {
          name: 'variety',
          displayName: '综艺',
          href: 'https://www.bilibili.com/variety/',
        },
        {
          name: 'documentary',
          displayName: '纪录片',
          href: 'https://www.bilibili.com/documentary/',
        },
      ]
      items.push(
        ...pgcItems.map(item => ({
          ...item,
          content: item.displayName,
          active: document.URL.startsWith(item.href),
        })),
      )
    })
  },
}
