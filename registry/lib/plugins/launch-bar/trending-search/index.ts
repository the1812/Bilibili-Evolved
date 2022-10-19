import { PluginMetadata } from '@/plugins/plugin'

export const plugin: PluginMetadata = {
  name: 'launchBar.trendingSearch',
  displayName: '搜索栏 - 搜索推荐',
  description: '在脚本的搜索栏中默认显示类似 b 站搜索栏的搜索推荐词, 替代原来的 "搜索" 两字.',
  setup: ({ addData }) => {
    addData('launchBar.recommended', async (data: { word: string; href: string }) => {
      const { getJson } = await import('@/core/ajax')
      const json = await getJson('https://api.bilibili.com/x/web-interface/search/default')
      if (json.code === 0) {
        data.word = json.data.show_name
        let href: string
        if (json.data.url !== '') {
          href = json.data.url
        } else if (json.data.name.startsWith('av')) {
          href = `https://www.bilibili.com/${json.data.name}`
        } else {
          href = `https://search.bilibili.com/all?keyword=${json.data.name}`
        }
        data.href = href
      } else {
        console.error('获取搜索推荐词失败')
      }
    })
  },
}
