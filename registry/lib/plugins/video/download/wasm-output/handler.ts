import { DownloadPackage, PackageEntry } from '@/core/download'
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
  const toast = Toast.info('正在加载 FFmpeg', `${pluginTitle} - 初始化`)
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
  ffmetadata: string,
  outputMkv: boolean,
  pageIndex = 1,
  totalPages = 1,
) {
  const toast = Toast.info('', `${pluginTitle} - ${pageIndex} / ${totalPages}`)

  ffmpeg.writeFile('video', await httpGet(videoUrl, toastProgress(toast, '正在下载视频流')))
  ffmpeg.writeFile('audio', await httpGet(audioUrl, toastProgress(toast, '正在下载音频流')))

  const args = ['-i', 'video', '-i', 'audio']

  if (ffmetadata) {
    ffmpeg.writeFile('ffmetadata', new TextEncoder().encode(ffmetadata))
    args.push('-i', 'ffmetadata', '-map_metadata', '2')
    if (!outputMkv) {
      args.push('-movflags', '+use_metadata_tags')
    }
  }

  args.push('-codec', 'copy', '-f', outputMkv ? 'matroska' : 'mp4', 'output')

  console.debug('FFmpeg commandline args:', args.join(' '))

  toast.message = '混流中……'
  await ffmpeg.exec(args)

  const output = await ffmpeg.readFile('output')
  const outputBlob = new Blob([output], {
    type: outputMkv ? 'video/x-matroska' : 'video/mp4',
  })

  toast.message = '完成！'
  toast.duration = 1000

  await DownloadPackage.single(
    name.replace(/.[^/.]+$/, `.${outputMkv ? 'mkv' : 'mp4'}`),
    outputBlob,
  )
}

export async function run(action: DownloadVideoAction) {
  if (!ffmpeg.loaded) {
    await loadFFmpeg()
  }

  const { infos: pages, extraAssets } = action

  let ffmetadata: PackageEntry[]
  const extraAssetsForBrowser = []
  for (const { asset, instance } of extraAssets) {
    if (!ffmetadata && asset.name === 'saveVideoMetadata' && instance.type === 'ffmetadata') {
      ffmetadata = await asset.getAssets(pages, instance)
    } else {
      extraAssetsForBrowser.push({ asset, instance })
    }
  }
  action.extraAssets = extraAssetsForBrowser

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
