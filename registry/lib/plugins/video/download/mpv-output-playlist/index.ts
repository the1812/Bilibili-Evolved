import { PluginMetadata } from '@/plugins/plugin'
import { DownloadVideoOutput } from '../../../../components/video/download/types'
import { mpvPlaylist } from './mpv-playlist'

export const plugin: PluginMetadata = {
  name: 'downloadVideo.outputs.mpv-playlist',
  displayName: '下载视频 - MPV 播放支持（列表）',
  author: {
    name: 'wuliic',
    link: 'https://github.com/wullic',
  },
  description:
    '为下载视频增加 MPV 输出支持,支持列表播放，配置方式请参考 [playwithmpv](https://github.com/videoanywhere/playwithmpv)',
  setup: ({ addData }) => {
    addData('downloadVideo.outputs', (outputs: DownloadVideoOutput[]) => {
      outputs.push(mpvPlaylist)
    })
  },
}
