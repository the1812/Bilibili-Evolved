import type { LaunchBarActionProvider } from '@/components/launch-bar/launch-bar-action'
import type { PluginMetadata } from '@/plugins/plugin'
import { getJson } from '@/core/ajax'
import { createLinkAction, matchInput } from '../common'

export const plugin: PluginMetadata = {
  name: 'launchBar.actions.audioSearch',
  displayName: '搜索栏 - 音频跳转',
  async setup({ addData }) {
    addData('launchBar.actions', (providers: LaunchBarActionProvider[]) => {
      providers.push({
        name: 'audioSearchProvider',
        getActions: async input => {
          const { match, type, id, indexer } = matchInput(input, /^(a[um])(\d+)$/)
          if (!match) {
            return []
          }
          const json = await getJson(
            type === 'am'
              ? `https://www.bilibili.com/audio/music-service-c/web/menu/info?sid=${id}`
              : `https://www.bilibili.com/audio/music-service-c/web/song/info?sid=${id}`,
          )
          const { title } = lodash.get(json, 'data', {})
          return [
            createLinkAction({
              name: title,
              description: type === 'am' ? '播放列表跳转' : '音频跳转',
              link: `https://www.bilibili.com/audio/${indexer}`,
              indexer,
            }),
          ]
        },
      })
    })
  },
}
