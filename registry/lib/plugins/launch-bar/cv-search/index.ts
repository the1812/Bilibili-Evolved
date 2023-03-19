import type { LaunchBarActionProvider } from '@/components/launch-bar/launch-bar-action'
import type { PluginMetadata } from '@/plugins/plugin'
import { getJson } from '@/core/ajax'
import { createLinkAction, matchInput } from '../common'

export const plugin: PluginMetadata = {
  name: 'launchBar.actions.cvSearch',
  displayName: '搜索栏 - 专栏跳转',
  async setup({ addData }) {
    addData('launchBar.actions', (providers: LaunchBarActionProvider[]) => {
      providers.push({
        name: 'cvSearchProvider',
        getActions: async input => {
          const { match, type, id, indexer } = matchInput(input, /^(cv|rl)(\d+)$/)
          if (!match) {
            return []
          }
          if (type === 'rl') {
            const json = await getJson(
              `https://api.bilibili.com/x/article/list/web/articles?id=${id}`,
            )
            const { name } = lodash.get(json, 'data.list', {})
            return [
              createLinkAction({
                name,
                description: '文集跳转',
                link: `https://www.bilibili.com/read/readlist/${indexer}`,
                indexer,
              }),
            ]
          }
          const json = await getJson(`https://api.bilibili.com/x/article/viewinfo?id=${id}`)
          const { title } = lodash.get(json, 'data', {})
          return [
            createLinkAction({
              name: title,
              description: '专栏跳转',
              link: `https://www.bilibili.com/read/${indexer}`,
              indexer,
            }),
          ]
        },
      })
    })
  },
}
