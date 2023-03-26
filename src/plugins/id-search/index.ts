import { LaunchBarActionProvider, LaunchBarAction } from '@/components/launch-bar/launch-bar-action'
import { PluginMetadata } from '../plugin'
import { IdSearchProvider } from './types'

const getCopyItem = async (name: string, id: string, original: string) => {
  const item: LaunchBarAction = {
    name: id,
    icon: 'mdi-content-copy',
    description: `复制${name}`,
    indexer: original,
    action: async () => {
      if (item.name === id) {
        await navigator.clipboard.writeText(id)
        const { Toast } = await import('@/core/toast')
        Toast.success('复制成功', `复制${name}`, 1500)
      }
    },
  }
  return [item]
}
const idMatches: IdSearchProvider[] = [
  {
    pattern: /^av([\d]+)$/i,
    getActions: async match => {
      const { getJsonWithCredentials } = await import('@/core/ajax')
      const json = await getJsonWithCredentials(
        `https://api.bilibili.com/x/web-interface/view?aid=${match[1]}`,
      )
      const data = lodash.get(json, 'data', {})
      const { bvid, title } = data
      const indexer = `av${match[1]}`

      return {
        name: title || indexer,
        description: 'av号跳转',
        indexer,
        link: `https://www.bilibili.com/av${match[1]}`,
        extraActions: bvid ? await getCopyItem('BV号', bvid, indexer) : [],
      }
    },
  },
  {
    pattern: /^bv([\da-zA-Z]+)$/i,
    getActions: async match => {
      const { getJsonWithCredentials } = await import('@/core/ajax')
      const json = await getJsonWithCredentials(
        `https://api.bilibili.com/x/web-interface/view?bvid=${match[1]}`,
      )
      const data = lodash.get(json, 'data', {})
      const { aid, title } = data
      const indexer = `BV${match[1]}`

      return {
        name: title || indexer,
        description: 'BV号跳转',
        indexer,
        link: `https://www.bilibili.com/BV${match[1]}`,
        extraActions: aid ? await getCopyItem('av号', `av${aid}`, indexer) : [],
      }
    },
  },
]
export const plugin: PluginMetadata = {
  name: 'launchBar.actions.IDSearch',
  displayName: '搜索栏 - 视频跳转',
  async setup() {
    const { addData } = await import('../data')
    const { LaunchBarActionProviders } = await import('@/components/launch-bar/launch-bar-action')
    addData(LaunchBarActionProviders, (providers: LaunchBarActionProvider[]) => {
      providers.push({
        name: 'IDSearchProvider',
        getActions: async input => {
          const results: LaunchBarAction[] = []
          for (const it of idMatches) {
            const match = input.match(it.pattern)
            if (match) {
              const {
                name,
                description = '',
                indexer,
                link,
                extraActions = [],
              } = await it.getActions(match)
              results.push(
                {
                  name,
                  icon: 'mdi-open-in-new',
                  indexer,
                  description,
                  action: () => {
                    window.open(link, '_blank')
                  },
                  order: 0,
                },
                ...extraActions,
              )
            }
          }
          return results
        },
      })
    })
  },
}
