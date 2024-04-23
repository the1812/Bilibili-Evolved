import { DownloadPackage } from '@/core/download'
import { meta } from '@/core/meta'
import { Toast } from '@/core/toast'
import { FFmpeg } from './ffmpeg'
import { getCacheOrGet, httpGet, toastProgress, toBlobUrl } from './utils'

const ffmpeg = new FFmpeg()

async function load(toast: Toast) {
  await ffmpeg.load({
    workerLoadURL: toBlobUrl(
      await getCacheOrGet(
        'ffmpeg-worker',
        meta.compilationInfo.altCdn.library.ffmpeg.worker,
        toastProgress(toast, '正在加载 FFmpeg Worker'),
      ),
      'text/javascript',
    ),
    coreURL: toBlobUrl(
      await getCacheOrGet(
        'ffmpeg-core',
        meta.compilationInfo.altCdn.library.ffmpeg.core,
        toastProgress(toast, '正在加载 FFmpeg Core'),
      ),
      'text/javascript',
    ),
    wasmURL: toBlobUrl(
      await getCacheOrGet(
        'ffmpeg-wasm',
        meta.compilationInfo.altCdn.library.ffmpeg.wasm,
        toastProgress(toast, '正在加载 FFmpeg WASM'),
      ),
      'application/wasm',
    ),
  })
}
export async function run(
  name: string,
  toast: Toast,
  videoUrl: string,
  audioUrl: string,
  isFlac: boolean,
) {
  if (!ffmpeg.loaded) {
    await load(toast)
  }

  ffmpeg.writeFile('video', await httpGet(videoUrl, toastProgress(toast, '正在下载视频流')))
  ffmpeg.writeFile('audio', await httpGet(audioUrl, toastProgress(toast, '正在下载音频流')))
  toast.message = '混流中……'

  const outputExt = isFlac ? 'mkv' : 'mp4'
  name = isFlac ? name.replace(/.[^/.]+$/, `.${outputExt}`) : name
  await ffmpeg.exec([
    '-i',
    'video',
    '-i',
    'audio',
    '-c:v',
    'copy',
    '-c:a',
    isFlac ? 'flac' : 'copy',
    '-f',
    isFlac ? 'matroska' : 'mp4',
    `output.${outputExt}`,
  ])

  const output = await ffmpeg.readFile(`output.${outputExt}`)
  const outputBlob = new Blob([output], {
    type: isFlac ? 'video/x-matroska' : 'video/mp4',
  })

  toast.message = '完成！'
  toast.duration = 1500

  await DownloadPackage.single(name, outputBlob)
}
