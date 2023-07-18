import type { LaunchBarActionProvider } from '@/components/launch-bar/launch-bar-action'
import type { PluginMetadata } from '@/plugins/plugin'
import { getJson } from '@/core/ajax'
import { createLinkAction, matchInput } from '../common'

export const plugin: PluginMetadata = {
  name: 'launchBar.actions.uidSearch',
  displayName: '搜索栏 - UID 跳转',
  async setup({ addData }) {
    addData('launchBar.actions', (providers: LaunchBarActionProvider[]) => {
      providers.push({
        name: 'uidSearchProvider',
        getActions: async input => {
          const { match, id, indexer } = matchInput(input, /^(uid)(\d+)$/)
          if (!match) {
            return []
          }
          const json = await getJson(`https://api.bilibili.com/x/space/wbi/acc/info?mid=${id}`)
          const { name } = lodash.get(json, 'data', {})
          return [
            createLinkAction({
              name,
              description: '用户跳转',
              link: `https://space.bilibili.com/${id}`,
              indexer,
            }),
          ]
        },
      })
    })
  },
}
