import type { LaunchBarActionProvider } from '@/components/launch-bar/launch-bar-action'
import type { PluginMetadata } from '@/plugins/plugin'
import { getJson } from '@/core/ajax'

export const plugin: PluginMetadata = {
  name: 'launchBar.actions.cvSearch',
  displayName: '搜索栏 - 专栏跳转',
  async setup({ addData }) {
    addData('launchBar.actions', (providers: LaunchBarActionProvider[]) => {
      providers.push({
        name: 'cvSearchProvider',
        getActions: async input => {
          const match = input.match(/^(cv|rl)(\d+)$/)
          if (!match) {
            return []
          }
          const type = match[1]
          const id = match[2]
          const indexer = `${type}${id}`
          if (type === 'rl') {
            const json = await getJson(
              `https://api.bilibili.com/x/article/list/web/articles?id=${id}`,
            )
            const { name } = lodash.get(json, 'data.list', {})
            return [
              {
                name: name || indexer,
                icon: 'mdi-open-in-new',
                indexer,
                description: '文集跳转',
                action: () => {
                  window.open(`https://www.bilibili.com/read/readlist/${indexer}`, '_blank')
                },
                order: 0,
              },
            ]
          }
          const json = await getJson(`https://api.bilibili.com/x/article/viewinfo?id=${id}`)
          const { title } = lodash.get(json, 'data', {})
          return [
            {
              name: title || indexer,
              icon: 'mdi-open-in-new',
              indexer,
              description: '专栏跳转',
              action: () => {
                window.open(`https://www.bilibili.com/read/${indexer}`, '_blank')
              },
              order: 0,
            },
          ]
        },
      })
    })
  },
}
