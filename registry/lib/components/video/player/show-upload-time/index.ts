import { defineComponentMetadata } from '@/components/define'
import { urlChange } from '@/core/observer'
import { playerReady, matchUrlPattern } from '@/core/utils'
import { videoUrls, mediaListUrls } from '@/core/utils/urls'
import { useScopedConsole } from '@/core/utils/log'
import { addComponentListener } from '@/core/settings'
import { TestPattern } from '@/core/common-types'
import desc from './desc.md'
import { Video } from './video'
import { DefaultVideo } from './defaultVideo'
import { MediaListVideo } from './mediaListVideo'

const displayName = '显示视频投稿时间'
const console = useScopedConsole(displayName)
export const component = defineComponentMetadata({
  author: { name: 'wisokey', link: 'https://github.com/wisokey' },
  name: 'showUploadTime',
  displayName,
  description: desc,
  tags: [componentsTags.video],
  urlInclude: videoUrls,
  options: {
    formatString: {
      displayName: '文本格式',
      defaultValue: 'up · yyyy-MM-dd',
      validator: (value: string, oldValue: string) => (!value?.trim() ? oldValue : value),
    },
  },
  instantStyles: [
    {
      name: 'showUploadTime',
      style: () => import('./show-upload-time.scss'),
    },
  ],
  entry: async ({ metadata }) => {
    const defaultVideo = new DefaultVideo(console)
    const VideoMap: { TestPattern: TestPattern; video: Video }[] = [
      {
        // 普通视频页面
        TestPattern: videoUrls.slice(0, 1),
        video: defaultVideo,
      },
      {
        // 合集类视频页面
        TestPattern: mediaListUrls,
        video: new MediaListVideo(console),
      },
    ]

    const getMatchVideo = () => {
      for (const item of VideoMap) {
        for (const pattern of item.TestPattern) {
          if (matchUrlPattern(pattern)) {
            return item.video
          }
        }
      }
      return defaultVideo // 默认使用 DefaultVideo
    }

    addComponentListener(
      `${metadata.name}.formatString`,
      (value: string, oldValue: string) => {
        const video = getMatchVideo()
        if (video) {
          video.settingChange(metadata, value, oldValue)
        }
      },
      false,
    )

    urlChange(async () => {
      console.debug('urlChange now url is', document.URL)
      await playerReady()
      const video = getMatchVideo()
      if (video) {
        video.urlChange(metadata)
      }
    })
  },
})
