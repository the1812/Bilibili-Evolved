import { LaunchBarActionProvider, LaunchBarAction } from '@/components/launch-bar/launch-bar-action'
import { PluginMetadata } from '../plugin'

const getCopyItem = async (name: string, id: string, original: string) => {
  const item: LaunchBarAction = {
    name: id,
    icon: 'mdi-content-copy',
    description: `复制${name}`,
    indexer: original,
    action: async () => {
      if (item.name === id) {
        await navigator.clipboard.writeText(id)
      }
    },
  }
  return [item]
}
const idMatches = [
  {
    pattern: /^av([\d]+)$/i,
    name: (match: RegExpMatchArray) => `av${match[1]}`,
    badge: 'av号跳转',
    link: (match: RegExpMatchArray) => `https://www.bilibili.com/av${match[1]}`,
    extend: async (match: RegExpMatchArray) => {
      const { getJsonWithCredentials } = await import('@/core/ajax')
      const json = await getJsonWithCredentials(`https://api.bilibili.com/x/web-interface/view?aid=${match[1]}`)
      const bv = lodash.get(json, 'data.bvid', null)
      if (bv === null) {
        return []
      }
      return getCopyItem('BV号', bv, `av${match[1]}`)
    },
  },
  {
    pattern: /^bv([\da-zA-Z]+)$/i,
    name: (match: RegExpMatchArray) => `BV${match[1]}`,
    badge: 'BV号跳转',
    link: (match: RegExpMatchArray) => `https://www.bilibili.com/BV${match[1]}`,
    extend: async (match: RegExpMatchArray) => {
      const { getJsonWithCredentials } = await import('@/core/ajax')
      const json = await getJsonWithCredentials(`https://api.bilibili.com/x/web-interface/view?bvid=${match[1]}`)
      const av = lodash.get(json, 'data.aid', null)
      if (av === null) {
        return []
      }
      return getCopyItem('av号', `av${av}`, `BV${match[1]}`)
    },
  },
]
export const plugin: PluginMetadata = {
  name: 'launchBar.actions.IDSearch',
  displayName: 'ID搜索快速跳转',
  async setup() {
    const { addData } = await import('../data')
    const { LaunchBarActionProviders } = await import('@/components/launch-bar/launch-bar-action')
    addData(LaunchBarActionProviders, (providers: LaunchBarActionProvider[]) => {
      providers.push({
        name: 'IDSearchProvider',
        // getEnterAction: input => {
        //   for (const it of idMatches) {
        //     const match = input.match(it.pattern)
        //     if (match) {
        //       return () => window.open(it.link(match), '_blank')
        //     }
        //   }
        //   return null
        // },
        getActions: async input => {
          const results: LaunchBarAction[] = []
          for (const it of idMatches) {
            const match = input.match(it.pattern)
            if (match) {
              results.push({
                name: it.name(match),
                icon: 'mdi-open-in-new',
                description: it.badge,
                action: () => {
                  window.open(it.link(match), '_blank')
                },
              })
              if (it.extend) {
                const actions = await it.extend(match)
                results.push(...actions)
              }
            }
          }
          return results
        },
      })
    })
  },
}
