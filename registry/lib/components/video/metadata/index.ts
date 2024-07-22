import { defineComponentMetadata } from '@/components/define'
import { PackageEntry } from '@/core/download'
import { hasVideo } from '@/core/spin-query'
import { videoUrls } from '@/core/utils/urls'
import { DownloadVideoAssets } from '../download/types'
import { generateFFMetadataBlob } from './utils'

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
  name: 'saveVideoMetadata',
  displayName: '保存视频元数据',
  description:
    '保存视频元数据（标题、描述、UP、章节等）为 [FFMETADATA](https://ffmpeg.org/ffmpeg-formats.html#metadata) 格式',
  author,
  tags: [componentsTags.video],
  entry: none,
  urlInclude: videoUrls,
  widget: {
    condition: hasVideo,
    component: () => import('./SaveMetadata.vue').then(m => m.default),
  },
  plugin: {
    displayName: '下载视频 - 保存元数据',
    author,
    setup: ({ addData }) => {
      addData('downloadVideo.assets', async (assets: DownloadVideoAssets[]) => {
        assets.push({
          name: 'saveMetadata',
          displayName: '保存元数据',
          getAssets: async (infos, instance: { saveMetadata: boolean }) => {
            const { saveMetadata: enabled } = instance
            if (enabled) {
              const result: PackageEntry[] = []
              for (const info of infos) {
                result.push({
                  name: `${info.input.title}.ffmetadata.txt`,
                  data: await generateFFMetadataBlob(info.input.aid, info.input.cid),
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
