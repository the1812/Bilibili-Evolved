import { StreamSaverLibrary } from '@/core/runtime-library'
import { Toast } from '@/core/toast'
import { extractFlac } from './flac'
import { DownloadVideoOutput } from '../types'

/** 无损音频片段会被解封装成裸 FLAC, 因此只对这个扩展名做处理 */
const flacExtension = '.flac'
const serviceWorkerMessage =
  '需要浏览器允许来自 jimmywarting.github.io (StreamSaver 的网站) 的第三方 cookie, 详细原因见 <a href="https://github.com/jimmywarting/StreamSaver.js?#how-does-it-work" target="blank">How does it work</a>'
export const streamSaverOutput: DownloadVideoOutput = {
  name: 'steamSaver',
  displayName: 'StreamSaver',
  description: `使用 StreamSaver 输出到本地文件, 下载过程中请勿关闭页面. 注意: ${serviceWorkerMessage}, 否则弹出的链接点击后会没有反应.`,
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
        const fragment = fragments[index]
        const { title, url, size } = fragment
        const isFlac =
          fragment.type === 'flacAudio' && fragment.extension.toLowerCase() === flacExtension
        // 裸 FLAC 的大小要在解封装后才能知道, 因此不传 size
        const fileStream = isFlac
          ? streamSaver.createWriteStream(title)
          : streamSaver.createWriteStream(title, { size })
        const response = await fetch(url)
        if (isFlac) {
          const data = new Uint8Array(await response.arrayBuffer())
          const writer = fileStream.getWriter()
          await writer.write(extractFlac(data) ?? data)
          await writer.close()
          return
        }
        await response.body.pipeTo(fileStream)
      })
    })
  },
}
