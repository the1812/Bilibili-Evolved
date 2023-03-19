import type { LaunchBarActionProvider } from '@/components/launch-bar/launch-bar-action'
import type { PluginMetadata } from '@/plugins/plugin'
import { getJson } from '@/core/ajax'

export const plugin: PluginMetadata = {
  name: 'launchBar.actions.audioSearch',
  displayName: '搜索栏 - 音频跳转',
  async setup({ addData }) {
    addData('launchBar.actions', (providers: LaunchBarActionProvider[]) => {
      providers.push({
        name: 'audioSearchProvider',
        getActions: async input => {
          const match = input.match(/^(a[um])(\d+)$/)
          if (!match) {
            return []
          }
          const type = match[1]
          const id = match[2]
          const indexer = `${type}${id}`
          const json = await getJson(
            type === 'am'
              ? `https://www.bilibili.com/audio/music-service-c/web/menu/info?sid=${id}`
              : `https://www.bilibili.com/audio/music-service-c/web/song/info?sid=${id}`,
          )
          const { title } = lodash.get(json, 'data', {})
          return [
            {
              name: title || indexer,
              icon: 'mdi-open-in-new',
              indexer,
              description: type === 'am' ? '播放列表跳转' : '音频跳转',
              action: () => {
                window.open(`https://www.bilibili.com/audio/${indexer}`, '_blank')
              },
              order: 0,
            },
          ]
        },
      })
    })
  },
}
