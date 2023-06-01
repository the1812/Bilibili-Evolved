import type { LaunchBarActionProvider } from '@/components/launch-bar/launch-bar-action'
import type { PluginMetadata } from '@/plugins/plugin'
import { getJson, getJsonWithCredentials } from '@/core/ajax'
import { createLinkAction, matchInput } from '../common'

export const plugin: PluginMetadata = {
  name: 'launchBar.actions.numberSearch',
  displayName: '搜索栏 - 数字联想',
  async setup({ addData }) {
    addData('launchBar.actions', (providers: LaunchBarActionProvider[]) => {
      providers.push({
        name: 'numberSearchProvider',
        getActions: async input => {
          const { match, id, indexer } = matchInput(input, /^()(\d+)$/)
          if (!match) {
            return []
          }
          const [aidJson, cvJson] = await Promise.all([
            await getJsonWithCredentials(`https://api.bilibili.com/x/web-interface/view?aid=${id}`),
            await getJson(`https://api.bilibili.com/x/article/viewinfo?id=${id}`),
          ])
          const { title: videoName } = lodash.get(aidJson, 'data', {})
          const { title: articleName } = lodash.get(cvJson, 'data', {})
          return [
            createLinkAction({
              name: videoName,
              description: '视频跳转',
              link: `https://www.bilibili.com/av${id}`,
              indexer,
            }),
            createLinkAction({
              name: articleName,
              description: '专栏跳转',
              link: `https://www.bilibili.com/read/cv${id}`,
              indexer,
            }),
          ]
        },
      })
    })
  },
}
