import { getGeneralSettings } from '@/core/settings'
import { formatVariables, getTitleVariables } from '@/core/utils/title'
import { videoUrls } from '@/core/utils/urls'
import { DownloadVideoInput } from '../../types'

export const videoSingleInput: DownloadVideoInput = {
  name: 'video',
  displayName: '当前视频',
  match: videoUrls,
  getInputs: async () => {
    const variables = getTitleVariables(true)
    return [
      {
        aid: unsafeWindow.aid,
        cid: unsafeWindow.cid,
        title: formatVariables(getGeneralSettings().filenameFormat, variables),
        variables,
      },
    ]
  },
  component: () => import('./SingleVideoInfo.vue').then(m => m.default),
}
