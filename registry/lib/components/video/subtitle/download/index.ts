import { defineComponentMetadata } from '@/components/define'
import type { PackageEntry } from '@/core/download'
import { hasVideo } from '@/core/spin-query'
import { Toast } from '@/core/toast'
import { videoAndBangumiUrls } from '@/core/utils/urls'

import type { DownloadVideoAssets } from '../../download/types'
import type { SubtitleDownloadType } from './utils'
import { getBlobByType } from './utils'

export const component = defineComponentMetadata({
  name: 'downloadSubtitle',
  displayName: '下载字幕',
  description: {
    'zh-CN': '启用下载字幕支持, 在视频页面中可从功能面板里下载字幕.',
  },
  tags: [componentsTags.video],
  entry: none,
  urlInclude: videoAndBangumiUrls,
  widget: {
    condition: hasVideo,
    component: () => import('./DownloadSubtitle.vue').then(m => m.default),
  },
  plugin: {
    displayName: '下载视频 - 下载字幕支持',
    setup: ({ addData }) => {
      addData('downloadVideo.assets', async (assets: DownloadVideoAssets[]) => {
        assets.push({
          name: 'downloadSubtitles',
          displayName: '下载字幕',
          getAssets: async (
            infos,
            instance: {
              type: SubtitleDownloadType
              enabled: boolean
            },
          ) => {
            const { type, enabled } = instance
            if (!enabled) {
              return []
            }
            const toast = Toast.info('获取字幕中...', '下载字幕')
            let downloadedItemCount = 0
            const results = await Promise.allSettled(
              infos.map(async info => {
                const blob = await getBlobByType(type, info.input)
                downloadedItemCount++
                toast.message = `获取字幕中... (${downloadedItemCount}/${infos.length})`
                return {
                  name: `${info.input.title}.${type}`,
                  data: blob,
                }
              }),
            )
            const success = results.filter(
              it => it.status === 'fulfilled',
            ) as PromiseFulfilledResult<PackageEntry>[]
            const fail = results.filter(it => it.status === 'rejected') as PromiseRejectedResult[]
            toast.message = `获取完成. 成功 ${success.length} 个, 失败 ${fail.length} 个.`
            return success.map(it => it.value)
          },
          component: () => import('./Plugin.vue').then(m => m.default),
        })
      })
    },
  },
})
