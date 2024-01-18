import { DownloadPackage } from '@/core/download'
import { meta } from '@/core/meta'
import { Toast } from '@/core/toast'
import { FFmpeg } from './ffmpeg'
import { httpGet, toBlobUrl, toastProgress } from './utils'

const ffmpeg = new FFmpeg()

async function load(toast: Toast) {
  await ffmpeg.load({
    workerLoadURL: await toBlobUrl(
      meta.compilationInfo.altCdn.library.ffmpeg.worker,
      'text/javascript',
      toastProgress(toast, '正在加载 FFmpeg Worker'),
    ),
    coreURL: await toBlobUrl(
      meta.compilationInfo.altCdn.library.ffmpeg.core,
      'text/javascript',
      toastProgress(toast, '正在加载 FFmpeg Core'),
    ),
    wasmURL: await toBlobUrl(
      meta.compilationInfo.altCdn.library.ffmpeg.wasm,
      'application/wasm',
      toastProgress(toast, '正在加载 FFmpeg WASM'),
    ),
  })
}
export async function run(name: string, videoUrl: string, audioUrl: string, toast: Toast) {
  if (!ffmpeg.loaded) {
    await load(toast)
  }

  ffmpeg.writeFile('video', await httpGet(videoUrl, toastProgress(toast, '正在下载视频流')))
  ffmpeg.writeFile('audio', await httpGet(audioUrl, toastProgress(toast, '正在下载音频流')))

  toast.message = '混流中……'

  await ffmpeg.exec(['-i', 'video', '-i', 'audio', '-c:v', 'copy', '-c:a', 'copy', 'output.mp4'])

  const output = await ffmpeg.readFile('output.mp4')
  const outputBlob = new Blob([output], {
    type: 'video/mp4',
  })

  toast.message = '完成！'
  toast.duration = 1500

  await DownloadPackage.single(name, outputBlob)
}
