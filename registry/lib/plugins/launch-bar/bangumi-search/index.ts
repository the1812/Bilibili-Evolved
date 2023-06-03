import type { LaunchBarActionProvider } from '@/components/launch-bar/launch-bar-action'
import type { PluginMetadata } from '@/plugins/plugin'
import { getJson } from '@/core/ajax'
import { createLinkAction, matchInput } from '../common'

export const plugin: PluginMetadata = {
  name: 'launchBar.actions.bangumiSearch',
  displayName: '搜索栏 - 番剧跳转',
  async setup({ addData }) {
    addData('launchBar.actions', (providers: LaunchBarActionProvider[]) => {
      providers.push({
        name: 'bangumiSearchProvider',
        getActions: async input => {
          const { match, type, id, indexer } = matchInput(input, /^(md|ss|ep)(\d+)$/)
          if (!match) {
            return []
          }
          if (type === 'md') {
            const json = await getJson(`https://api.bilibili.com/pgc/review/user?media_id=${id}`)
            const { title } = lodash.get(json, 'result.media', {})
            return [
              createLinkAction({
                name: title,
                description: '番剧详情跳转',
                link: `https://www.bilibili.com/bangumi/media/${indexer}`,
                indexer,
              }),
            ]
          }
          if (type === 'ep') {
            const json = await getJson(`https://api.bilibili.com/pgc/view/web/season?ep_id=${id}`)
            const episodes = lodash.get(json, 'result.episodes', []) as {
              id: number
              share_copy: string
            }[]
            const episode = episodes.find(e => e.id.toString() === id)
            return [
              createLinkAction({
                name: episode?.share_copy,
                description: '番剧跳转',
                link: `https://www.bilibili.com/bangumi/play/${indexer}`,
                indexer,
              }),
            ]
          }
          const json = await getJson(`https://api.bilibili.com/pgc/view/web/season?season_id=${id}`)
          const { title } = lodash.get(json, 'result', {})
          return [
            createLinkAction({
              name: title,
              description: '番剧跳转',
              link: `https://www.bilibili.com/bangumi/play/${indexer}`,
              indexer,
            }),
          ]
        },
      })
    })
  },
}
