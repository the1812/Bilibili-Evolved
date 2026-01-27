import { PluginMetadata } from '@/plugins/plugin'
import { DownloadVideoOutput } from '../../../../components/video/download/types'
import { abdmRest } from './abdm-rest'

export const plugin: PluginMetadata = {
  name: 'downloadVideo.outputs.abdm',
  displayName: '下载视频 - ABDM 输出支持',
  author: {
    name: 'Dragon1573 (with Amazon Q)',
    link: 'https://github.com/Dragon1573',
  },
  description: '为下载视频增加 ABDM 外部下载器支持.',
  setup: ({ addData }) => {
    addData('downloadVideo.outputs', (outputs: DownloadVideoOutput[]) => {
      outputs.push(abdmRest)
    })
  },
}
