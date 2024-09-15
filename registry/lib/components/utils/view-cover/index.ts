import { defineComponentMetadata } from '@/components/define'
import { getVideoCoverUrlByAid, getBlobByAid } from '@/components/video/video-cover'
import { PackageEntry } from '@/core/download'
import { videoAndBangumiUrls } from '@/core/utils/urls'
import { Toast } from '@/core/toast'
import { DownloadVideoAssets } from '../../video/download/types'
import { CoverDownloadType } from './types'

export const component = defineComponentMetadata({
  name: 'viewCover',
  displayName: '查看封面',
  tags: [
    componentsTags.utils,
    componentsTags.video,
    // componentsTags.live,
  ],
  entry: none,
  reload: none,
  unload: none,
  plugin: {
    displayName: '下载视频 - 下载封面支持',
    setup: ({ addData }) => {
      addData('downloadVideo.assets', async (assets: DownloadVideoAssets[]) => {
        assets.push({
          name: 'downloadCover',
          displayName: '下载封面',
          getAssets: async (
            infos,
            instance: {
              type: CoverDownloadType
              enabled: boolean
            },
          ) => {
            const { type, enabled } = instance
            if (!enabled) {
              return []
            }
            const toast = Toast.info('获取封面中...', '下载封面')
            let downloadedItemCount = 0
            const results = await Promise.allSettled(
              infos.map(async info => {
                const blob = await getBlobByAid(info.input.aid)
                downloadedItemCount++
                toast.message = `获取封面中... (${downloadedItemCount}/${infos.length})`
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
          getUrls: async (
            infos,
            instance: {
              type: CoverDownloadType
              enabled: boolean
            },
          ) => {
            const { type, enabled } = instance
            if (!enabled) {
              return []
            }
            return Promise.all(
              infos.map(async info => {
                return {
                  name: `${info.input.title}.${type}`,
                  url: await getVideoCoverUrlByAid(info.input.aid),
                }
              }),
            )
          },
          component: () => import('./Plugin.vue').then(m => m.default),
        })
      })
    },
  },
  widget: {
    component: () => import('./ViewCover.vue').then(m => m.default),
  },
  description: {
    'zh-CN': '在视频页面中, 可从功能面板中查看封面.',
  },
  urlInclude: [
    ...videoAndBangumiUrls,
    // ...liveUrls,
  ],
})
