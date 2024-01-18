import { PluginMetadata } from '@/plugins/plugin'
import { DownloadVideoOutput } from '../../../../components/video/download/types'

export const plugin: PluginMetadata = {
  name: 'downloadVideo.outputs.empty',
  displayName: '下载视频 - 空输出',
  setup: ({ addData }) => {
    addData('downloadVideo.outputs', (outputs: DownloadVideoOutput[]) => {
      outputs.push({
        name: 'empty',
        displayName: '空',
        description: '不输出视频本身, 仅获取下载视频的附带产物.',
        runAction: async () => lodash.noop(),
      })
    })
  },
}
