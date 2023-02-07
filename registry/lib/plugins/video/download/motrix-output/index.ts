import { Toast } from '@/core/toast'
import { PluginMetadata } from '@/plugins/plugin'
import { DownloadVideoOutput } from '../../../../components/video/download/types'

export const plugin: PluginMetadata = {
  name: 'downloadVideo.outputs.motrix',
  displayName: '下载视频 - Motrix 输出支持',
  description: '为下载视频增加 Motrix 输出支持.',
  setup: ({ addData }) => {
    addData('downloadVideo.outputs', (outputs: DownloadVideoOutput[]) => {
      outputs.push({
        name: 'motrix',
        displayName: 'Motrix',
        description: '调用 Motrix 下载.',
        runAction: async action => {
          const fragments = action.infos.flatMap(it => it.titledFragments)
          try {
            const params = new URLSearchParams({
              uris: fragments.map(f => f.url).join('\n'),
              referer: document.URL.replace(window.location.search, ''),
            })
            window.open(`motrix://new-task?${params.toString()}`, '_self')
          } catch (error) {
            Toast.error(String(error), '发生错误')
          }
        },
      })
    })
  },
}
