import { StreamSaverLibrary } from '@/core/runtime-library'
import { Toast } from '@/core/toast'
import { DownloadVideoOutput } from '../types'

export const streamSaverOutput: DownloadVideoOutput = {
  name: 'steamSaver',
  displayName: 'StreamSaver',
  description: '使用 StreamSaver 输出到本地文件, 下载过程中请勿关闭页面.',
  runAction: async action => {
    const streamSaver = await StreamSaverLibrary
    const fragments = action.infos.flatMap(it => it.titledFragments)
    const toast = Toast.show(
      fragments
        .map((f, index) => `<a class="link" data-index="${index}">${f.title}</a>`)
        .join('\n'),
      '下载视频',
    )
    const element = await toast.element
    dqa(element, 'a[data-index]').forEach((span: HTMLElement) => {
      span.addEventListener('click', async () => {
        const { index } = span.dataset
        const { title, url, size } = fragments[index]
        const fileStream = streamSaver.createWriteStream(title, {
          size,
        })
        const response = await fetch(url)
        await response.body.pipeTo(fileStream)
      })
    })
  },
}
