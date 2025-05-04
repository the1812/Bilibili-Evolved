import { PluginMetadata } from '@/plugins/plugin'
import { DownloadVideoOutput } from '../../../../components/video/download/types'
import { MPV_Ex } from './handler'

export const plugin: PluginMetadata = {
  name: 'downloadVideo.outputs.mpv-ex',
  displayName: '下载视频 - MPV 输出支持加强版',
  author: {
    name: 'asuaaa',
    link: 'https://github.com/Asukaaaaaa',
  },
  description:
    '为下载视频增加 MPV 输出，支持导出列表, 配置方式请参考 [README](https://github.com/Asukaaaaaa/tricks/blob/main/Bilibili-Evolved%20mpv-ex%20%E6%8F%92%E4%BB%B6.md)',
  setup: ({ addData }) => {
    addData('downloadVideo.outputs', (outputs: DownloadVideoOutput[]) => {
      outputs.push(MPV_Ex)
    })
  },
}
