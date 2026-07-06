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
  setup: ({ addData }) => {
    addData('downloadVideo.outputs', (outputs: DownloadVideoOutput[]) => {
      outputs.push(MPV_Ex)
    })
  },
}
