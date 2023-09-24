import { getJson } from '@/core/ajax'
import { getGeneralSettings } from '@/core/settings'
import { formatNumber } from '@/core/utils/formatters'
import { logError } from '@/core/utils/log'
import { formatTitle } from '@/core/utils/title'
import { bangumiUrls } from '@/core/utils/urls'
import { DownloadVideoInput } from '../../types'
import { createEpisodesPicker, EpisodeItem } from '../episode-item'

export const bangumiBatchInput: DownloadVideoInput = {
  name: 'bangumi.batch',
  displayName: '当前番剧 (多P)',
  match: bangumiUrls,
  batch: true,
  getInputs: async instance => instance?.checkedInputItems ?? [],
  component: async () =>
    createEpisodesPicker(async instance => {
      const metadata = dq('script[type="application/ld+json"]')
      if (!metadata) {
        logError('获取番剧数据失败: 无法找到 Metadata')
        return []
      }
      const metadataJson = JSON.parse(metadata.innerHTML.trim())
      const metaUrl: string = lodash.get(metadataJson, 'itemListElement.0.url', null)
      if (metaUrl === null) {
        logError('获取番剧数据失败: 无法找到 metaUrl')
        return []
      }
      const seasonId = metaUrl.match(/play\/ss(\d+)/)?.[1]
      if (seasonId === undefined) {
        logError('获取番剧数据失败: 无法解析 Season ID')
        return []
      }
      const json = await getJson(
        `https://api.bilibili.com/pgc/web/season/section?season_id=${seasonId}`,
      )
      if (json.code !== 0) {
        logError(`获取番剧数据失败: 无法获取番剧集数列表, message=${json.message}`)
        return []
      }
      const mapEpisodeItem = (totalLength: number) => {
        return (it: any, index: number) => {
          const nText: string = it.long_title ? it.title : (index + 1).toString()
          const title: string = it.long_title ? it.long_title : it.title
          return {
            key: it.cid,
            title: `${nText} - ${title}`,
            isChecked: index < instance.maxCheckedItems,
            inputItem: {
              aid: it.aid,
              cid: it.cid,
              title: formatTitle(getGeneralSettings().batchFilenameFormat, false, {
                ep: title,
                cid: it.cid,
                aid: it.aid,
                n: formatNumber(parseFloat(nText), totalLength) ?? nText,
              }),
              allowQualityDrop: true,
            },
          } as EpisodeItem
        }
      }
      const items: any[] = json.result.main_section.episodes
      const subItems: any[] =
        json.result.section?.flatMap((subSection: any) => subSection.episodes) ?? []
      const allItems = [...items, ...subItems]
      return allItems.map(mapEpisodeItem(allItems.length))
    }),
}
