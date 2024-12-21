import { DownloadPackage } from '@/core/download'
import { UserAgent } from '@/core/utils/constants'
import { getFriendlyTitle } from '@/core/utils/title'
import { PluginMetadata } from '@/plugins/plugin'
import { DownloadVideoOutput } from '../../../../components/video/download/types'

export const plugin: PluginMetadata = {
  name: 'downloadVideo.outputs.idm',
  displayName: '下载视频 - IDM 输出支持',
  description: '为下载视频增加 IDM 输出支持.',
  setup: ({ addData }) => {
    addData('downloadVideo.outputs', (outputs: DownloadVideoOutput[]) => {
      outputs.push({
        name: 'idm',
        displayName: 'IDM',
        description:
          '使用 IDM 的 .ef2 格式导出, 可以在 IDM 中使用导入开始下载, 建议配合 [ef2.exe](https://github.com/MotooriKashin/ef2) 以简化操作、保留文件名.',
        runAction: async action => {
          const { infos } = action
          const referer = document.URL.replace(window.location.search, '')
          const items = infos
            .map(info =>
              info.titledFragments.map(f =>
                `<
${f.url}
referer: ${referer}
User-Agent: ${UserAgent}
filename: ${f.title}
>`.trim(),
              ),
            )
            .flat()
          const input = items
            .concat('')
            .join('\n')
            .replace(/([^\r])\n/g, '$1\r\n')
          await DownloadPackage.single(`${getFriendlyTitle()}.ef2`, input)
        },
      })
    })
  },
}
