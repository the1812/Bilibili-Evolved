import { Toast } from '@/core/toast'
import { PluginMetadata } from '@/plugins/plugin'
import { DownloadVideoOutput } from '../../../../components/video/download/types'
import { run } from './handler'

export const title = 'WASM 混流输出'
const desc = '使用 WASM 在浏览器中下载并合并音视频, 支持批量下载'

export const plugin: PluginMetadata = {
  name: 'downloadVideo.outputs.wasm',
  displayName: `下载视频 - ${title}`,
  description: desc,
  author: {
    name: 'WakelessSloth56',
    link: 'https://github.com/WakelessSloth56',
  },
  setup: ({ addData }) => {
    addData('downloadVideo.outputs', (outputs: DownloadVideoOutput[]) => {
      outputs.push({
        name: 'wasm',
        displayName: 'WASM',
        description: `${desc}。运行过程中请勿关闭页面，初次使用或清除缓存后需要加载约 30 MB 的 WASM 文件。`,
        runAction: async (action, instance) => {
          try {
            await run(action, instance.muxWithMetadata)
          } catch (error) {
            Toast.error(String(error), title)
          }
        },
        component: () => import('./Config.vue').then(m => m.default),
      })
    })
  },
}
