import { PluginMetadata } from '@/plugins/plugin'
import { DownloadVideoOutput } from '../../../../components/video/download/types'
import { aria2Input } from './aria2-input'
import { aria2Rpc } from './aria2-rpc'

export const plugin: PluginMetadata = {
  name: 'downloadVideo.outputs.aria2',
  displayName: '下载视频 - aria2 输出支持',
  description: '为下载视频增加 aria2 文件导出和 RPC 输出支持.',
  setup: ({ addData }) => {
    addData('downloadVideo.outputs', (outputs: DownloadVideoOutput[]) => {
      outputs.push(aria2Input)
      outputs.push(aria2Rpc)
    })
  },
}
