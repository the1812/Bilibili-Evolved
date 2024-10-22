import { defineComponentMetadata } from '@/components/define'
import { PackageEntry } from '@/core/download'
import { hasVideo } from '@/core/spin-query'
import { Toast } from '@/core/toast'
import { videoAndBangumiUrls } from '@/core/utils/urls'
import { DownloadVideoAssets } from '../../download/types'
import { DanmakuDownloadType } from './utils'
import { downloadDanmakuOptions } from './options'

export const component = defineComponentMetadata({
  name: 'downloadDanmaku',
  displayName: '下载弹幕',
  description: {
    'zh-CN':
      '启用下载弹幕支持, 在视频和番剧页面中可从功能面板里下载弹幕. 请注意 ASS 弹幕下载不会包含高级弹幕, 字幕弹幕等.',
  },
  tags: [componentsTags.video],
  entry: none,
  reload: none,
  unload: none,
  options: downloadDanmakuOptions,
  plugin: {
    displayName: '下载视频 - 下载弹幕支持',
    setup: ({ addData }) => {
      addData('downloadVideo.assets', async (assets: DownloadVideoAssets[]) => {
        const { getBlobByType } = await import('./utils')
        assets.push({
          name: 'downloadDanmaku',
          displayName: '下载弹幕',
          getAssets: async (
            infos,
            instance: {
              type: DanmakuDownloadType
              enabled: boolean
            },
          ) => {
            const { type, enabled } = instance
            if (!enabled) {
              return []
            }
            const toast = Toast.info('获取弹幕中...', '下载弹幕')
            let downloadedItemCount = 0
            const results = await Promise.allSettled(
              infos.map(async info => {
                const blob = await getBlobByType(type, info.input)
                downloadedItemCount++
                toast.message = `获取弹幕中... (${downloadedItemCount}/${infos.length})`
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
  urlInclude: videoAndBangumiUrls,
  widget: {
    condition: hasVideo,
    component: () => import('./DownloadDanmaku.vue').then(m => m.default),
  },
})
