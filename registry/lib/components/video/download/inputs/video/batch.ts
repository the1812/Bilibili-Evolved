import { getJsonWithCredentials } from '@/core/ajax'
import { getGeneralSettings } from '@/core/settings'
import { formatDuration, formatNumber } from '@/core/utils/formatters'
import { logError } from '@/core/utils/log'
import { formatTitle } from '@/core/utils/title'
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
      const { pages } = json.data
      if (pages === undefined) {
        logError('获取视频选集列表失败, 没有找到选集信息.')
        return []
      }
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
              cid: page.cid,
              n: formatNumber(page.page, pages.length),
              ep: page.part,
            }),
            cid: page.cid,
            aid,
          },
        } as EpisodeItem
      })
    }),
}
