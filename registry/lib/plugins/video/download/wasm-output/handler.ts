import { DownloadPackage, PackageEntry } from '@/core/download'
import { meta } from '@/core/meta'
import { getComponentSettings } from '@/core/settings'
import { Toast } from '@/core/toast'
import { formatPercent } from '@/core/utils/formatters'
import { title as pluginTitle } from '.'
import type { Options } from '../../../../components/video/download'
import { DownloadVideoAction } from '../../../../components/video/download/types'
import { FFmpeg } from './ffmpeg'
import { getCacheOrFetch, httpGet, toastProgress, toBlobUrl } from './utils'

const ffmpeg = new FFmpeg()

async function loadFFmpeg() {
  const toast = Toast.info('正在加载 FFmpeg', `${pluginTitle} - 初始化`)

  const progress = toastProgress(toast)
  const [worker, core, wasm] = await Promise.all([
    getCacheOrFetch(
      'ffmpeg-worker',
      meta.compilationInfo.altCdn.library.ffmpeg.worker,
      progress(0, '正在加载 FFmpeg Worker'),
    ),
    getCacheOrFetch(
      'ffmpeg-core',
      meta.compilationInfo.altCdn.library.ffmpeg.core,
      progress(1, '正在加载 FFmpeg Core'),
    ),
    getCacheOrFetch(
      'ffmpeg-wasm',
      meta.compilationInfo.altCdn.library.ffmpeg.wasm,
      progress(2, '正在加载 FFmpeg WASM'),
    ),
  ])

  await ffmpeg.load({
    workerLoadURL: toBlobUrl(worker, 'text/javascript'),
    coreURL: toBlobUrl(core, 'text/javascript'),
    wasmURL: toBlobUrl(wasm, 'application/wasm'),
  })

  toast.message = '完成！'
  toast.close()
}

async function single(
  name: string,
  videoUrl: string,
  audioUrl: string,
  ffmetadata: string,
  outputMkv: boolean,
  pageIndex = 1,
  totalPages = 1,
) {
  const toast = Toast.info('', `${pluginTitle} - ${pageIndex} / ${totalPages}`)

  const progress = toastProgress(toast)
  const [video, audio] = await Promise.all([
    httpGet(videoUrl, progress(0, '正在下载视频流')),
    httpGet(audioUrl, progress(1, '正在下载音频流')),
  ])

  await ffmpeg.writeFile('video', video)
  await ffmpeg.writeFile('audio', audio)

  const args = ['-i', 'video', '-i', 'audio']

  if (ffmetadata) {
    await ffmpeg.writeFile('ffmetadata', new TextEncoder().encode(ffmetadata))
    args.push('-i', 'ffmetadata', '-map_metadata', '2')
    if (!outputMkv) {
      args.push('-movflags', '+use_metadata_tags')
    }
  }

  args.push('-codec', 'copy', '-f', outputMkv ? 'matroska' : 'mp4', 'output')

  console.debug('FFmpeg commandline args:', args.join(' '))

  ffmpeg.onProgress(event => {
    toast.message = `混流中: ${formatPercent(event.progress)}`
  })
  await ffmpeg.exec(args)

  const output = await ffmpeg.readFile('output')
  const outputBlob = new Blob([output], {
    type: outputMkv ? 'video/x-matroska' : 'video/mp4',
  })

  toast.message = '完成！'
  toast.duration = 1000

  await Promise.all([
    ffmpeg.deleteFile('video'),
    ffmpeg.deleteFile('audio'),
    ffmpeg.deleteFile('output'),
    ffmetadata ? ffmpeg.deleteFile('ffmetadata') : Promise.resolve(),
  ])

  await DownloadPackage.single(
    name.replace(/.[^/.]+$/, `.${outputMkv ? 'mkv' : 'mp4'}`),
    outputBlob,
  )
}

export async function run(action: DownloadVideoAction, muxWithMetadata: boolean) {
  if (!ffmpeg.loaded) {
    await loadFFmpeg()
  }

  const { infos: pages, extraAssets } = action

  let ffmetadata: PackageEntry[]
  if (muxWithMetadata) {
    const extraAssetsForBrowser = []
    for (const { asset, instance } of extraAssets) {
      if (!ffmetadata && asset.name === 'saveVideoMetadata' && instance.type === 'ffmetadata') {
        ffmetadata = await asset.getAssets(pages, instance)
      } else {
        extraAssetsForBrowser.push({ asset, instance })
      }
    }
    action.extraAssets = extraAssetsForBrowser
  }

  const { dashAudioExtension, dashFlacAudioExtension, dashVideoExtension } =
    getComponentSettings<Options>('downloadVideo').options

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]
    const [video, audio] = page.titledFragments
    if (
      !(
        page.fragments.length === 2 &&
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
      <string>ffmetadata?.[i]?.data,
      audio.extension === dashFlacAudioExtension,
      i + 1,
      pages.length,
    )
  }
}
