import { FFmpeg, ProgressEvent } from './ffmpeg'
import { Format, OutputFormats, OutputType } from './types'

const mp4Format: Format = {
  extension: 'mp4',
  mime: 'video/mp4',
  muxArgs: (hasCover, hasMetadata, isFlac) => {
    const args = ['-i', 'video', '-i', 'audio']
    if (hasCover && hasMetadata) {
      args.push('-i', 'cover', '-i', 'metadata')
      args.push('-map', '0', '-map', '1', '-map', '2')
      args.push('-map_metadata', '3', '-disposition:2', 'attached_pic')
      // mdta atom 格式元数据和封面互相干扰，不启用 +use_metadata_tags
    } else if (hasCover && !hasMetadata) {
      args.push('-i', 'cover')
      args.push('-map', '0', '-map', '1', '-map', '2')
      args.push('-disposition:2', 'attached_pic')
    } else if (!hasCover && hasMetadata) {
      args.push('-i', 'metadata')
      args.push('-map_metadata', '2', '-movflags', '+use_metadata_tags')
    }
    args.push('-codec:v', 'copy')
    args.push('-codec:a', isFlac ? 'alac' : 'copy') // MP4不支持FLAC，使用ALAC重新编码FLAC
    args.push('-f', 'mp4')
    return args
  },
}

const mkvFormat: Format = {
  extension: 'mkv',
  mime: 'video/x-matroska',
  muxArgs: (hasCover, hasMetadata) => {
    const args = ['-i', 'video', '-i', 'audio']
    if (hasCover && hasMetadata) {
      args.push('-i', 'metadata', '-attach', 'cover')
      args.push('-map', '0', '-map', '1')
      args.push('-map_metadata', '2')
      args.push('-metadata:s:t:0', 'mimetype=image/jpeg', '-metadata:s:t:0', 'filename=cover.jpg')
    } else if (hasCover && !hasMetadata) {
      args.push('-attach', 'cover')
      args.push('-metadata:s:t:0', 'mimetype=image/jpeg', '-metadata:s:t:0', 'filename=cover.jpg')
    } else if (!hasCover && hasMetadata) {
      args.push('-i', 'metadata', '-map_metadata', '2')
    }
    args.push('-codec', 'copy', '-f', 'matroska')
    return args
  },
}

const outputFormats: OutputFormats = {
  mp4: mp4Format,
  matroska: mkvFormat,
}

export async function mux(
  ffmpeg: FFmpeg,
  outputType: OutputType,
  callback: (event: ProgressEvent) => void,
  video: Uint8Array,
  audio: Uint8Array,
  isFlac: boolean,
  cover: Uint8Array,
  metadata: Uint8Array,
) {
  if (outputType === 'auto') {
    // 自动选择格式：
    // FLAC音轨   -> MKV
    // 元数据+封面 -> MKV
    outputType = isFlac ? 'matroska' : 'mp4'
    outputType = cover && metadata ? 'matroska' : outputType
  }

  const format = outputFormats[outputType]

  const args = format.muxArgs(!!cover, !!metadata, isFlac)
  args.push('output')
  console.debug('FFmpeg commandline args:', args.join(' '))

  await ffmpeg.writeFile('video', video)
  await ffmpeg.writeFile('audio', audio)
  if (cover) {
    await ffmpeg.writeFile('cover', cover)
  }
  if (metadata) {
    await ffmpeg.writeFile('metadata', metadata)
  }

  ffmpeg.onProgress(callback)
  await ffmpeg.exec(args)

  const output = await ffmpeg.readFile('output')
  const outputBlob = new Blob([output], { type: format.mime })

  await Promise.all([
    ffmpeg.deleteFile('video'),
    ffmpeg.deleteFile('audio'),
    ffmpeg.deleteFile('output'),
    metadata ? ffmpeg.deleteFile('metadata') : Promise.resolve(),
    cover ? ffmpeg.deleteFile('cover') : Promise.resolve(),
  ])

  return { data: outputBlob, format }
}
