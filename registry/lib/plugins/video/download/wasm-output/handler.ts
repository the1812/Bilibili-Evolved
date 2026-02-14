import { DownloadPackage, PackageEntry } from '@/core/download'
import { meta } from '@/core/meta'
import { getComponentSettings } from '@/core/settings'
import { Toast } from '@/core/toast'
import { formatFileSize, formatPercent } from '@/core/utils/formatters'
import { title as pluginTitle } from '.'
import type { Options } from '../../../../components/video/download'
import { DownloadVideoAction } from '../../../../components/video/download/types'
import { FFmpeg } from './ffmpeg'
import { mux } from './muxer'
import { OutputType } from './types'
import { getCacheOrFetch, getContentLength, httpGet, toastProgress, toBlobUrl } from './utils'

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
  coverUrl: string,
  ffmetadata: string,
  outputType: OutputType,
  isFlac: boolean,
  pageIndex = 1,
  totalPages = 1,
) {
  const toast = Toast.info('', `${pluginTitle} - ${pageIndex} / ${totalPages}`)

  const progress = toastProgress(toast)
  const [video, audio] = await Promise.all([
    httpGet(videoUrl, progress(0, '正在下载视频流')),
    httpGet(audioUrl, progress(1, '正在下载音频流')),
  ])

  let cover: Uint8Array
  if (coverUrl) {
    cover = await httpGet(coverUrl, progress(0, '正在下载封面'))
  }

  let metadata: Uint8Array
  if (ffmetadata) {
    metadata = new TextEncoder().encode(ffmetadata)
  }

  const muxProgress = event => {
    toast.message = `混流中: ${formatPercent(event.progress)}`
  }

  const {
    data: output,
    format: { extension },
  } = await mux(ffmpeg, outputType, muxProgress, video, audio, isFlac, cover, metadata)

  toast.message = '完成！'
  toast.duration = 1000

  await DownloadPackage.single(name.replace(/.[^/.]+$/, `.${extension}`), output)
}

export async function run(
  action: DownloadVideoAction,
  outputType: OutputType,
  muxWithMetadata: boolean,
  attachCover: boolean,
) {
  if (!ffmpeg.loaded) {
    await loadFFmpeg()
  }

  const { infos: pages, extraAssets, extraOnlineAssets } = action

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

  let cover: { name: string; url: string }[]
  if (attachCover) {
    const extraOnlineAssetsForBrowser = []
    for (const { asset, instance } of extraOnlineAssets) {
      if (!cover && asset.name === 'downloadCover' && instance.type === 'jpg') {
        cover = await asset.getUrls(pages, instance)
      } else {
        extraOnlineAssetsForBrowser.push({ asset, instance })
      }
    }
    action.extraOnlineAssets = extraOnlineAssetsForBrowser
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

    const [videoSize, audioSize] = await Promise.all([
      getContentLength(video.url),
      getContentLength(audio.url),
    ])
    const size = Math.max(videoSize, video.size) + Math.max(audioSize, audio.size)
    // 2000 * 1024 * 1024
    if (size > 2097152000) {
      throw new Error(`仅支持合并 2GB 内的音视频（${formatFileSize(size)}）`)
    }

    await single(
      video.title,
      video.url,
      audio.url,
      cover?.[i]?.url,
      <string>ffmetadata?.[i]?.data,
      outputType,
      audio.extension === dashFlacAudioExtension,
      i + 1,
      pages.length,
    )
  }
}
