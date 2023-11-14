import { CdnTypes } from '@/core/cdn-types'
import { DownloadPackage } from '@/core/download'
import { meta } from '@/core/meta'
import { Toast } from '@/core/toast'
import { FFmpeg, VERSION } from './ffmpeg'
import { httpget, toBlobUrl, toastProgress } from './utils'

const ffmpeg = new FFmpeg()

function cdnUrl(p: string, file: string) {
  return `https://${
    meta.compilationInfo.allCdns[CdnTypes.jsDelivr].host
  }/npm/@ffmpeg/${p}@${VERSION}/dist/umd/${file}`
}

async function load(toast: Toast) {
  await ffmpeg.load({
    workerLoadURL: await toBlobUrl(
      cdnUrl('ffmpeg', '814.ffmpeg.js'),
      'text/javascript',
      toastProgress(toast, '正在加载 FFmpeg Worker'),
    ),
    coreURL: await toBlobUrl(
      cdnUrl('core', 'ffmpeg-core.js'),
      'text/javascript',
      toastProgress(toast, '正在加载 FFmpeg Core'),
    ),
    wasmURL: await toBlobUrl(
      cdnUrl('core', 'ffmpeg-core.wasm'),
      'application/wasm',
      toastProgress(toast, '正在加载 FFmpeg WASM'),
    ),
  })
}
export async function run(name: string, videoUrl: string, audioUrl: string, toast: Toast) {
  if (!ffmpeg.loaded) {
    await load(toast)
  }

  ffmpeg.writeFile('video', await httpget(videoUrl, toastProgress(toast, '正在下载视频流')))
  ffmpeg.writeFile('audio', await httpget(audioUrl, toastProgress(toast, '正在下载音频流')))

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
