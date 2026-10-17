const sampleEntryPath = ['moov', 'trak', 'mdia', 'minf', 'stbl', 'stsd', 'ec-3']

function* readBoxes(view: DataView, start: number, end: number, count = Infinity) {
  let offset = start
  for (let i = 0; i < count && offset + 8 <= end; i++) {
    let size = view.getUint32(offset, false)
    const type = String.fromCharCode(
      view.getUint8(offset + 4),
      view.getUint8(offset + 5),
      view.getUint8(offset + 6),
      view.getUint8(offset + 7),
    )
    let headerSize = 8
    if (size === 1) {
      headerSize = 16
      if (offset + headerSize > end) {
        return
      }
      size = view.getUint32(offset + 8, false) * 2 ** 32 + view.getUint32(offset + 12, false)
    } else if (size === 0) {
      size = view.byteLength - offset
    }
    if (size < headerSize || size > end - offset) {
      return
    }
    yield { type, start: offset + headerSize, end: offset + size }
    offset += size
  }
}

const findChannelCountOffset = (
  view: DataView,
  start = 0,
  end = view.byteLength,
  depth = 0,
  count = Infinity,
): number => {
  for (const box of readBoxes(view, start, end, count)) {
    if (box.type !== sampleEntryPath[depth]) {
      continue
    }
    if (box.type === 'ec-3') {
      return box.end - box.start >= 28 ? box.start + 16 : -1
    }
    let childStart = box.start
    let childCount = Infinity
    if (box.type === 'stsd') {
      if (box.end - box.start < 8) {
        return -1
      }
      childStart += 8
      childCount = view.getUint32(box.start + 4, false)
    }
    const offset = findChannelCountOffset(view, childStart, box.end, depth + 1, childCount)
    if (offset >= 0) {
      return offset
    }
  }
  return -1
}

export const getEac3ChannelCount = (data: Uint8Array) => {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength)
  const offset = findChannelCountOffset(view)
  return offset < 0 ? 0 : view.getUint16(offset, false)
}

export const setEac3ChannelCount = (data: Uint8Array, channelCount: number) => {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength)
  const offset = findChannelCountOffset(view)
  if (offset >= 0) {
    view.setUint16(offset, channelCount, false)
  }
}
