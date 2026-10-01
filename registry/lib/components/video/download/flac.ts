/** 'fLaC' 文件头 */
const flacMagic = [0x66, 0x4c, 0x61, 0x43]
const readUint32 = (data: Uint8Array, offset: number) =>
  data[offset] * 16777216 + data[offset + 1] * 65536 + data[offset + 2] * 256 + data[offset + 3]
const findTag = (data: Uint8Array, tag: number[]) => {
  for (let i = 0; i <= data.length - tag.length; i++) {
    let matched = true
    for (let j = 0; j < tag.length; j++) {
      if (data[i + j] !== tag[j]) {
        matched = false
        break
      }
    }
    if (matched) {
      return i
    }
  }
  return -1
}
/** 'dfLa' (FLAC 元数据 box) */
const dflaTag = [0x64, 0x66, 0x4c, 0x61]

/**
 * B 站无损音频的 DASH 片段是 MP4 封装的 FLAC, 直接保存为 .flac 会被播放器判为无效.
 * 这里把各 mdat 的负载(FLAC 帧)拼接, 并在开头补上 dfLa 中的 FLAC 元数据, 还原成裸 FLAC.
 */
export const extractFlac = (data: Uint8Array) => {
  const frames: Uint8Array[] = []
  let metadata: Uint8Array
  let offset = 0
  while (offset + 8 <= data.length) {
    let size = readUint32(data, offset)
    const type = String.fromCharCode(
      data[offset + 4],
      data[offset + 5],
      data[offset + 6],
      data[offset + 7],
    )
    let headerSize = 8
    if (size === 1) {
      size = readUint32(data, offset + 8) * 0x100000000 + readUint32(data, offset + 12)
      headerSize = 16
    } else if (size === 0) {
      size = data.length - offset
    }
    if (size < headerSize || offset + size > data.length) {
      break
    }
    if (type === 'mdat') {
      frames.push(data.subarray(offset + headerSize, offset + size))
    } else if (type === 'moov') {
      const moov = data.subarray(offset + headerSize, offset + size)
      const index = findTag(moov, dflaTag)
      if (index >= 4) {
        // 跳过 dfLa 的 8 字节 box 头与 4 字节 fullbox version/flags
        metadata = moov.subarray(index + 8, index - 4 + readUint32(moov, index - 4))
      }
    }
    offset += size
  }
  if (metadata === undefined || frames.length === 0) {
    return null
  }
  const framesSize = frames.reduce((sum, frame) => sum + frame.length, 0)
  const result = new Uint8Array(4 + metadata.length + framesSize)
  result.set(flacMagic)
  result.set(metadata, 4)
  let position = 4 + metadata.length
  frames.forEach(frame => {
    result.set(frame, position)
    position += frame.length
  })
  return result
}
