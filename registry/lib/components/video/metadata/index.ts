import { defineComponentMetadata } from '@/components/define'
import { PackageEntry } from '@/core/download'
import { hasVideo } from '@/core/spin-query'
import { videoUrls } from '@/core/utils/urls'
import { DownloadVideoAssets } from '../download/types'
import { generateByType, MetadataType } from './metadata'

export const title = '保存视频元数据'
export const name = 'saveVideoMetadata'

const author = [
  {
    name: 'WakelessSloth56',
    link: 'https://github.com/WakelessSloth56',
  },
  {
    name: 'LainIO24',
    link: 'https://github.com/LainIO24',
  },
]

export const component = defineComponentMetadata({
  name,
  displayName: title,
  description: '保存视频元数据（标题、描述、UP、章节等）',
  author,
  tags: [componentsTags.video],
  entry: none,
  urlInclude: videoUrls,
  widget: {
    condition: hasVideo,
    component: () => import('./SaveMetadata.vue').then(m => m.default),
  },
  plugin: {
    displayName: `下载视频 - ${title}支持`,
    author,
    setup: ({ addData }) => {
      addData('downloadVideo.assets', async (assets: DownloadVideoAssets[]) => {
        assets.push({
          name,
          displayName: title,
          getAssets: async (
            infos,
            instance: {
              type: MetadataType
              enabled: boolean
            },
          ) => {
            const { type, enabled } = instance
            if (enabled) {
              const result: PackageEntry[] = []
              for (const info of infos) {
                result.push({
                  name: `${info.input.title}.${type}.txt`,
                  data: await generateByType(type, info.input.aid, info.input.cid),
                  options: {},
                })
              }
              return result
            }
            return []
          },
          component: () => import('./Plugin.vue').then(m => m.default),
        })
      })
    },
  },
})
