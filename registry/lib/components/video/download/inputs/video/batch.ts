import { getJsonWithCredentials } from '@/core/ajax'
import { getGeneralSettings } from '@/core/settings'
import { formatDuration, formatNumber } from '@/core/utils/formatters'
import { logError } from '@/core/utils/log'
import { formatTitle, getTitleVariablesFromDate } from '@/core/utils/title'
import { videoUrls } from '@/core/utils/urls'
import { DownloadVideoInput } from '../../types'
import { createEpisodesPicker, EpisodeItem } from '../episode-item'

export const videoBatchInput: DownloadVideoInput = {
  name: 'video.batch',
  displayName: '当前视频 (多P)',
  match: videoUrls,
  batch: true,
  getInputs: async instance => instance?.checkedInputItems ?? [],
  component: async () =>
    createEpisodesPicker(async instance => {
      const { aid } = unsafeWindow
      const api = `https://api.bilibili.com/x/web-interface/view?aid=${aid}`
      const json = await getJsonWithCredentials(api)
      if (json.code !== 0) {
        logError(`获取视频选集列表失败, message = ${json.message}`)
        return []
      }
      const { pages, owner, pubdate } = json.data
      if (pages === undefined) {
        logError('获取视频选集列表失败, 没有找到选集信息.')
        return []
      }
      const date = getTitleVariablesFromDate(new Date(pubdate * 1000))
      return pages.map((page: any, index: number) => {
        const key = page.cid
        const title = `P${page.page} ${page.part}`
        return {
          key,
          title,
          isChecked: index < instance.maxCheckedItems,
          durationText: formatDuration(page.duration),
          inputItem: {
            allowQualityDrop: true,
            title: formatTitle(getGeneralSettings().batchFilenameFormat, false, {
              n: formatNumber(page.page, pages.length),
              cid: page.cid,
              ep: page.part,
              user: owner?.name,
              userID: owner?.mid?.toString(),
              publishYear: date.year,
              publishMonth: date.month,
              publishDay: date.day,
              publishHour: date.hour,
              publishMinute: date.minute,
              publishSecond: date.second,
              publishMillisecond: date.millisecond,
            }),
            cid: page.cid,
            aid,
          },
        } as EpisodeItem
      })
    }),
}
export const videoSeasonBatchInput: DownloadVideoInput = {
  name: 'video.seasonBatch',
  displayName: '当前视频 (合集)',
  match: videoUrls,
  batch: true,
  getInputs: async instance => instance?.checkedInputItems ?? [],
  component: async () =>
    createEpisodesPicker(async instance => {
      const { aid, bvid } = unsafeWindow
      const api = `https://api.bilibili.com/x/web-interface/wbi/view/detail?bvid=${bvid}&aid=${aid}`
      const json = await getJsonWithCredentials(api)
      if (json.code !== 0) {
        logError(`获取视频合集列表失败, message = ${json.message}`)
        return []
      }
      const owner = lodash.get(json, 'data.View.owner', {})
      const sections: { episodes: any[] }[] = lodash.get(json, 'data.View.ugc_season.sections', [])
      if (sections.length === 0) {
        return []
      }
      const totalEpisodesLength = lodash.sumBy(sections, it => it.episodes.length)
      return sections.flatMap((section, sectionIndex) => {
        const { episodes = [] } = section
        return episodes.map((episode, episodeIndex) => {
          const currentIndex =
            episodeIndex + lodash.sumBy(sections.slice(0, sectionIndex), it => it.episodes.length)
          const key = episode.cid
          const page = currentIndex + 1
          const title = `P${page} ${episode.title}`
          const date = getTitleVariablesFromDate(new Date(episode.arc.pubdate * 1000))
          return {
            key,
            title,
            isChecked: currentIndex < instance.maxCheckedItems,
            durationText: formatDuration(episode.arc.duration),
            inputItem: {
              allowQualityDrop: true,
              title: formatTitle(getGeneralSettings().batchFilenameFormat, false, {
                n: formatNumber(page, totalEpisodesLength),
                title: episode.page.part,
                cid: episode.cid,
                aid: episode.aid,
                bvid: episode.bvid,
                ep: episode.title,
                user: owner.name,
                userID: owner.mid?.toString(),
                publishYear: date.year,
                publishMonth: date.month,
                publishDay: date.day,
                publishHour: date.hour,
                publishMinute: date.minute,
                publishSecond: date.second,
                publishMillisecond: date.millisecond,
              }),
              cid: episode.cid,
              aid: episode.aid,
            },
          } as EpisodeItem
        })
      })
    }),
}
