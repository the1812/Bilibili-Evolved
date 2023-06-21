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
          const [aidJson, cvJson, uidJson] = await Promise.all([
            await getJsonWithCredentials(`https://api.bilibili.com/x/web-interface/view?aid=${id}`),
            await getJson(`https://api.bilibili.com/x/article/viewinfo?id=${id}`),
            await getJson(`https://api.bilibili.com/x/web-interface/card?mid=${id}`),
          ])
          const { title: videoName } = lodash.get(aidJson, 'data', {})
          const { title: articleName } = lodash.get(cvJson, 'data', {})
          const { name: userName } = lodash.get(uidJson, 'data.card', {})
          const prefix = (name: string) => (name ? `numberSearchAction.${name}` : name)
          return [
            createLinkAction({
              name: prefix(videoName),
              displayName: videoName,
              description: '视频跳转',
              link: `https://www.bilibili.com/av${id}`,
              indexer,
            }),
            createLinkAction({
              name: prefix(id),
              displayName: id,
              description: '直播间跳转',
              link: `https://live.bilibili.com/${id}`,
              indexer,
            }),
            createLinkAction({
              name: prefix(articleName),
              displayName: articleName,
              description: '专栏跳转',
              link: `https://www.bilibili.com/read/cv${id}`,
              indexer,
            }),
            createLinkAction({
              name: prefix(userName),
              displayName: userName,
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
