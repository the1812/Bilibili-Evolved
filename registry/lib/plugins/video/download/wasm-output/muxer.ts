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

/** E-AC-3 采样条目里 channelcount 相对 'ec-3' 标签的偏移 */
const eac3ChannelCountOffset = 20
/** 'ec-3' 与其后紧跟的 'dec3' */
const eac3Tag = [0x65, 0x63, 0x2d, 0x33]
const dec3Tag = [0x64, 0x65, 0x63, 0x33]
const matchBytes = (data: Uint8Array, offset: number, bytes: number[]) => {
  for (let i = 0; i < bytes.length; i++) {
    if (data[offset + i] !== bytes[i]) {
      return false
    }
  }
  return true
}
/** 定位 mp4 的 E-AC-3 音频采样条目, 返回 'ec-3' 标签偏移 */
const findEac3SampleEntry = (data: Uint8Array) => {
  for (let i = 0; i < data.length - 39; i++) {
    // 采样条目后必然紧跟 dec3 box, 用它避免误匹配
    if (matchBytes(data, i, eac3Tag) && matchBytes(data, i + 36, dec3Tag)) {
      return i
    }
  }
  return -1
}
const getEac3ChannelCount = (data: Uint8Array) => {
  const index = findEac3SampleEntry(data)
  return index < 0
    ? 0
    : data[index + eac3ChannelCountOffset] * 256 + data[index + eac3ChannelCountOffset + 1]
}
/** ffmpeg 5.1 会把 mp4 中 E-AC-3 的 channelcount 固定写成 2, 这里改回真实声道数 */
const setEac3ChannelCount = (data: Uint8Array, channelCount: number) => {
  const index = findEac3SampleEntry(data)
  if (index >= 0) {
    data[index + eac3ChannelCountOffset] = Math.floor(channelCount / 256)
    data[index + eac3ChannelCountOffset + 1] = channelCount % 256
  }
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

  // writeFile 会把 buffer 转移给 worker, 因此要在写入前读取源音频的声道数
  const eac3ChannelCount = outputType === 'mp4' ? getEac3ChannelCount(audio) : 0

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
  if (eac3ChannelCount > 0) {
    setEac3ChannelCount(output, eac3ChannelCount)
  }
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
