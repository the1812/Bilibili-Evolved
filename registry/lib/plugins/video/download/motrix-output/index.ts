import { Toast } from '@/core/toast'
import { PluginMetadata } from '@/plugins/plugin'
import { DownloadVideoOutput } from '../../../../components/video/download/types'

export const plugin: PluginMetadata = {
  name: 'downloadVideo.outputs.motrix',
  displayName: '下载视频 - Motrix 输出支持',
  setup: ({ addData }) => {
    addData('downloadVideo.outputs', (outputs: DownloadVideoOutput[]) => {
      outputs.push({
        name: 'motrix',
        displayName: 'Motrix',
        description: '调用 Motrix 下载.',
        runAction: async action => {
          const urls = action.infos.flatMap(it => it.titledFragments.map(f => f.url))
          try {
            // Motrix 2 的链接只接受单个 uri, 多分段时靠它读取剪贴板自动填入
            if (urls.length === 1) {
              window.open(`motrix://new-task?${new URLSearchParams({ uri: urls[0] })}`, '_self')
              return
            }
            await navigator.clipboard.writeText(urls.join('\n'))
            window.open('motrix://new-task', '_self')
            Toast.info(
              `已复制 ${urls.length} 个链接, 新建任务时会自动填入, 未填入请手动粘贴.`,
              'Motrix',
              10000,
            )
          } catch (error) {
            Toast.error(`调用 Motrix 失败: ${error}`, 'Motrix')
          }
        },
      })
    })
  },
}
