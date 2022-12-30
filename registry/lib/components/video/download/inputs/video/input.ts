import { getFriendlyTitle } from '@/core/utils/title'
import { videoUrls } from '@/core/utils/urls'
import { DownloadVideoInput } from '../../types'

export const videoSingleInput: DownloadVideoInput = {
  name: 'video',
  displayName: '当前视频',
  match: videoUrls,
  getInputs: async () => [
    {
      aid: unsafeWindow.aid,
      cid: unsafeWindow.cid,
      title: getFriendlyTitle(true),
    },
  ],
  component: () => import('./SingleVideoInfo.vue').then(m => m.default),
}
