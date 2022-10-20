import { FeedsContentFilter } from '@/components/feeds/api'
import { getComponentSettings } from '@/core/settings'
import { PluginMetadata } from '@/plugins/plugin'
import { BlockableCard, hasBlockedPattern } from './pattern'

const bangumiFields = {
  username: 'title',
  text: 'epTitle',
}
const videoField = {
  username: 'upName',
  text: ['title', 'dynamic'],
}
const feedField = {
  username: ['username', 'repostUsername'],
  text: ['text', 'repostText'],
}
const filterableFields = [bangumiFields, videoField, feedField]
export const feedsFilterPlugin: PluginMetadata = {
  name: 'feeds.contentFilters.patterns',
  displayName: '动态关键词过滤',
  setup: ({ addData }) => {
    addData('feeds.contentFilters', (filters: FeedsContentFilter[]) => {
      filters.push({
        filter: (items: any[]) => {
          const { patterns } = getComponentSettings('feedsFilter').options as {
            patterns: string[]
          }
          return items.filter(item => {
            const field = filterableFields.find(it =>
              Object.values(it).every(fields => {
                if (Array.isArray(fields)) {
                  return fields.some(f => f in item)
                }
                return fields in item
              }),
            )
            const card = Object.fromEntries(
              Object.entries(field).map(([key, value]) => {
                if (Array.isArray(value)) {
                  return [
                    key,
                    value
                      .map(v => item[v] ?? '')
                      .join('\n')
                      .trim(),
                  ]
                }
                return [key, item[value].trim() as string]
              }),
            ) as Record<keyof BlockableCard, string>
            return patterns.every(p => !hasBlockedPattern(p, card as BlockableCard))
          })
        },
      })
    })
  },
}
