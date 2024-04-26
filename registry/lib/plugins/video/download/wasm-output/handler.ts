import { DownloadPackage } from '@/core/download'
import { meta } from '@/core/meta'
import { getComponentSettings } from '@/core/settings'
import { Toast } from '@/core/toast'
import { title as pluginTitle } from '.'
import type { Options } from '../../../../components/video/download'
import { DownloadVideoAction } from '../../../../components/video/download/types'
import { FFmpeg } from './ffmpeg'
import { getCacheOrGet, httpGet, toastProgress, toBlobUrl } from './utils'

const ffmpeg = new FFmpeg()

async function loadFFmpeg() {
  const toast = Toast.info('初始化', pluginTitle)
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
  toast.message = '完成！'
  toast.close()
}

async function single(
  name: string,
  videoUrl: string,
  audioUrl: string,
  isFlac: boolean,
  pageIndex = 1,
  totalPages = 1,
) {
  const toast = Toast.info('', `${pluginTitle} - ${pageIndex} / ${totalPages}`)

  ffmpeg.writeFile('video', await httpGet(videoUrl, toastProgress(toast, '正在下载视频流')))
  ffmpeg.writeFile('audio', await httpGet(audioUrl, toastProgress(toast, '正在下载音频流')))

  toast.message = '混流中……'
  const outputExt = isFlac ? 'mkv' : 'mp4'
  name = name.replace(/.[^/.]+$/, `.${outputExt}`)
  await ffmpeg.exec([
    '-i',
    'video',
    '-i',
    'audio',
    '-c:v',
    'copy',
    '-c:a',
    'copy',
    '-f',
    isFlac ? 'matroska' : 'mp4',
    `output.${outputExt}`,
  ])

  const output = await ffmpeg.readFile(`output.${outputExt}`)
  const outputBlob = new Blob([output], {
    type: isFlac ? 'video/x-matroska' : 'video/mp4',
  })

  toast.message = '完成！'
  toast.duration = 1000

  await DownloadPackage.single(name, outputBlob)
}

export async function run(action: DownloadVideoAction) {
  if (!ffmpeg.loaded) {
    await loadFFmpeg()
  }

  const pages = lodash.chunk(
    action.infos.flatMap(it => it.titledFragments),
    2,
  )

  const { dashAudioExtension, dashFlacAudioExtension, dashVideoExtension } =
    getComponentSettings<Options>('downloadVideo').options

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]
    const [video, audio] = page
    if (
      !(
        page.length === 2 &&
        video.extension === dashVideoExtension &&
        (audio.extension === dashAudioExtension || audio.extension === dashFlacAudioExtension)
      )
    ) {
      throw new Error('仅支持 DASH 格式视频和音频')
    }

    await single(
      video.title,
      video.url,
      audio.url,
      audio.extension === dashFlacAudioExtension,
      i + 1,
      pages.length,
    )
  }
}
