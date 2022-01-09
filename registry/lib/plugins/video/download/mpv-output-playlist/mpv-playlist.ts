import { postJson } from '@/core/ajax'
import { Toast } from '@/core/toast'
import { UserAgent } from '@/core/utils/constants'
import { logError } from '@/core/utils/log'
import { DownloadVideoOutput } from '../../../../components/video/download/types'

export const mpvPlaylist: DownloadVideoOutput = {
  name: 'mpv-playlist',
  displayName: 'MPV播放',
  description: '格式选择flv，千万不能选音画分离的dash。建议把mpv.exe所在目录加进环境变量。',
  runAction: async (action, instance) => {
    const { infos } = action
    const { mpvInfo } = instance
    const videoUrls = infos.flatMap(it => it.titledFragments).map(f => f.url)
    const videoTitles = infos.flatMap(it => it.titledFragments).map(f => f.title)
    // console.log(videoTitles)
    const data = {
      dir: mpvInfo.dir,
      referer: 'https://www.bilibili.com/',
      'user-agent': UserAgent,
      urls: videoUrls,
      titles: videoTitles,
    }
    const url = `http://${mpvInfo.host}:${mpvInfo.port}`
    const result = await postJson(url, data)
    const resp = JSON.parse(result)
    if (resp.success) {
      Toast.success(`成功发送了请求: ${resp.message}`, 'MPV播放', 3000)
    } else {
      logError(resp.message)
    }
  },
  component: () => import('./MpvConfig.vue').then(m => m.default),
}
