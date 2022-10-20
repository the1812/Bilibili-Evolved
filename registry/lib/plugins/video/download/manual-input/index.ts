import { bilibiliApi, getJsonWithCredentials } from '@/core/ajax'
import { getGeneralSettings } from '@/core/settings'
import { formatNumber } from '@/core/utils/formatters'
import { useScopedConsole } from '@/core/utils/log'
import { formatTitle } from '@/core/utils/title'
import { videoUrls } from '@/core/utils/urls'
import { PluginMetadata } from '@/plugins/plugin'
import {
  DownloadVideoInput,
  DownloadVideoInputItem,
} from '../../../../components/video/download/types'

export const plugin: PluginMetadata = {
  name: 'downloadVideo.inputs.manual',
  displayName: '下载视频 - 手动输入',
  description: '为下载视频增加手动输入支持.',
  setup: ({ addData }) => {
    addData('downloadVideo.inputs', (inputs: DownloadVideoInput[]) => {
      inputs.push({
        name: 'videoManual',
        displayName: '手动输入',
        match: videoUrls,
        batch: true,
        getInputs: async (instance: { ids: string[] }) => {
          const console = useScopedConsole('手动输入')
          const handleAid = (aid: string) => {
            const api = `https://api.bilibili.com/x/web-interface/view?aid=${aid}`
            return bilibiliApi(getJsonWithCredentials(api), `获取视频信息失败, aid = ${aid}`)
          }
          const handleBvid = (bvid: string) => {
            const api = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`
            return bilibiliApi(getJsonWithCredentials(api), `获取视频信息失败, bvid = ${bvid}`)
          }
          const apiData = await Promise.allSettled(
            instance.ids.map(id => {
              if (/av(\d+)/i.test(id)) {
                return handleAid(id)
              }
              if (/BV(.+)/i.test(id)) {
                return handleBvid(id)
              }
              console.error(`无效输入: ${id}`)
              return null
            }),
          )
          apiData
            .filter((it): it is PromiseRejectedResult => it.status === 'rejected')
            .forEach(result => {
              console.error(result.reason)
            })
          return apiData
            .filter((it): it is PromiseFulfilledResult<any> => it.status === 'fulfilled')
            .flatMap(result => {
              const { aid, cid, bvid, title, pages } = result.value
              if (pages.length > 1) {
                return (pages as any[]).map((page, index) => {
                  const item: DownloadVideoInputItem = {
                    aid: aid.toString(),
                    cid: page.cid.toString(),
                    bvid,
                    allowQualityDrop: true,
                    title: formatTitle(
                      getGeneralSettings().batchFilenameFormat,
                      false,
                      page.part
                        ? {
                            title,
                            n: formatNumber(index + 1, pages.length),
                            ep: page.part,
                          }
                        : { title },
                    ),
                  }
                  return item
                })
              }
              const item: DownloadVideoInputItem = {
                aid: aid.toString(),
                cid: cid.toString(),
                bvid,
                allowQualityDrop: true,
                title: formatTitle(getGeneralSettings().batchFilenameFormat, false, { title }),
              }
              return item
            })
        },
        component: () => import('./ManualInput.vue').then(m => m.default),
      })
    })
  },
}
