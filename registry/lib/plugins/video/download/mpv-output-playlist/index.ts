import { PluginMetadata } from '@/plugins/plugin'
import { DownloadVideoOutput } from '../../../../components/video/download/types'
import { mpvPlaylist } from './mpv-playlist'

export const plugin: PluginMetadata = {
  name: 'downloadVideo.outputs.mpv-playlist',
  displayName: '下载视频 - MPV 播放支持（列表）',
  // FIXME: plugin 也需要 author 字段
  description: 'by [@wuliic]\n\n为下载视频增加 MPV 输出支持,支持列表播放，配置方式请参考 [playwithmpv](https://github.com/videoanywhere/playwithmpv)',
  setup: ({ addData }) => {
    addData('downloadVideo.outputs', (outputs: DownloadVideoOutput[]) => {
      outputs.push(mpvPlaylist)
    })
  },
}
