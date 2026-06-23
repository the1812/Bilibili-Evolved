/* spellchecker:words pvdata */
import { bilibiliApi, getJsonWithCredentials } from '@/core/ajax'
import { meta } from '@/core/meta'
import { formatDateTime, formatDuration } from '@/core/utils/formatters'

/**
 * 解析二进制格式的 pvdata
 * @author WakelessSloth56
 * @returns 每个快照图对应的视频时间点，以秒为单位
 */
const parsePVData = async (data: ArrayBuffer) => {
  const view = new DataView(data)
  const result: number[] = []
  // i=2 跳过第一个值，第一个值恒为0，不算在视频时间里
  for (let i = 2; i < data.byteLength; i += 2) {
    result.push(view.getUint16(i, false))
  }
  return result
}

// =========================================================================== /

export interface SnapshotSprite {
  time: number
  spriteSheet: string
  col: number
  row: number
  x: number
  y: number
  width: number
  height: number
  canvas?: HTMLCanvasElement
}

/**
 * @author WakelessSloth56
 */
function parseSpriteData(
  spriteSheet: string,
  times: number[],
  cols: number,
  rows: number,
  width: number,
  height: number,
) {
  const s: SnapshotSprite[] = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const i = row * cols + col
      if (i >= times.length) {
        return s
      }
      const x = col * width
      const y = row * height
      s.push({
        time: times[i],
        spriteSheet,
        x,
        y,
        width,
        height,
        col,
        row,
        canvas: undefined,
      })
    }
  }
  return s
}

/**
 * 分割视频快照精灵图
 * @author WakelessSloth56
 * @param pvData 每个快照图的时间点 {@link parsePVData}
 * @param spriteUrls 精灵图的URL
 * @param cols 精灵图的列数
 * @param rows 精灵图的行数
 * @param width 快照图片的宽度
 * @param height 快照图片的长度
 */
async function splitSnapshots(
  pvData: number[],
  spriteUrls: string[],
  cols: number,
  rows: number,
  width: number,
  height: number,
  toCanvas = true,
) {
  const spriteSheets = lodash.zip(spriteUrls, lodash.chunk(pvData, cols * rows))
  const sprites = spriteSheets.map(([url, times]) => {
    const data = parseSpriteData(url, times, cols, rows, width, height)
    if (toCanvas) {
      return new Promise((resolve: (img: CanvasImageSource) => void, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = url
      }).then(img => {
        data.forEach(d => {
          const canvas = document.createElement('canvas')
          canvas.width = d.width
          canvas.height = d.height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, d.x, d.y, d.width, d.width, 0, 0, d.width, d.width)
          d.canvas = canvas
        })
        return data
      })
    }
    return new Promise((resolve: (value: SnapshotSprite[]) => void) => {
      resolve(data)
    })
  })
  return Promise.all(sprites).then(x => x.flat().sort((a, b) => a.time - b.time))
}

/**
 * 根据时间均匀的取样快照图到指定的数量
 * @author WakelessSloth56
 * @param count 需要的快照图数量
 */
function sampleByTime<T extends { time: number }>(snapshots: T[], count: number): T[] {
  if (snapshots.length <= count) {
    return snapshots
  }

  const times = snapshots.map(x => x.time)
  const minTime = times[0]
  const maxTime = times[times.length - 1]
  const duration = maxTime - minTime

  const result = []
  const timeStep = duration / (count - 1)

  for (let i = 0; i < count; i++) {
    const targetTime = minTime + i * timeStep
    const closest = snapshots.reduce((prev, curr) => {
      const prevDiff = Math.abs(prev.time - targetTime)
      const currDiff = Math.abs(curr.time - targetTime)
      return currDiff < prevDiff ? curr : prev
    })
    result.push(closest)
  }

  return [...new Set(result)]
}

// =========================================================================== /

export interface DrawOptions {
  fontSize?: number
  font?: string
  textColor?: string
  backgroundColor?: string
  paddingX?: number
  paddingY?: number
  marginX?: number
  marginY?: number
}

export interface GridInfoOptions {
  header?: string[]
  footer?: boolean
  timestamp?: boolean
}

/**
 * 在快照图上绘制对应的时间点
 * @author WakelessSloth56
 */
function drawTimestamp(snapshot: SnapshotSprite, options: DrawOptions = {}) {
  const timeStr = formatDuration(snapshot.time)
  const ctx = snapshot.canvas.getContext('2d')

  const {
    paddingX = 8,
    paddingY = 4,
    marginX = 6,
    marginY = 3,
    fontSize = 22,
    font = 'monospace',
    textColor = '#ffffff',
    backgroundColor = '#00000033',
  } = options

  ctx.font = `${fontSize}px '${font}'`
  const textW = ctx.measureText(timeStr).width

  const bgW = textW + paddingX * 2
  const bgH = fontSize + paddingY * 2

  const x = snapshot.canvas.width - bgW - marginX
  const y = snapshot.canvas.height - bgH - marginY

  ctx.fillStyle = backgroundColor
  ctx.fillRect(x, y, bgW, bgH)

  ctx.fillStyle = textColor
  ctx.textBaseline = 'top'
  ctx.fillText(timeStr, x + paddingX, y + paddingY)
}

/**
 * @author WakelessSloth56
 */
function createGrid(
  snapshots: SnapshotSprite[],
  cols: number,
  rows: number,
  spriteWidth: number,
  spriteHeight: number,
  options: DrawOptions & GridInfoOptions = {},
) {
  const {
    paddingX = 4,
    paddingY = 4,
    marginX = 12,
    marginY = 12,
    fontSize = 22,
    font: fontName = 'monospace',
    textColor = '#ffffff',
    backgroundColor = '#000000',
    header = [],
    footer = false,
    timestamp = true,
  } = options
  const font = `${fontSize}px '${fontName}'`

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  // 信息栏
  const headerCanvas = document.createElement('canvas')
  if (header && header.length > 0) {
    const infoCtx = headerCanvas.getContext('2d')
    infoCtx.font = font
    const maxWidth = Math.max(...header.map(x => infoCtx.measureText(x).width))
    headerCanvas.width = maxWidth
    headerCanvas.height = header.length * (fontSize + paddingY)
    infoCtx.font = font
    infoCtx.fillStyle = textColor
    infoCtx.textBaseline = 'top'
    let y = 0
    for (const info of header) {
      infoCtx.fillText(info, 0, y)
      y += fontSize + paddingY
    }
  } else {
    headerCanvas.width = 0
    headerCanvas.height = 0
  }

  const w =
    Math.max(
      // 防止超长标题溢出
      headerCanvas.width,
      cols * spriteWidth + (cols - 1) * paddingX, // 快照图宽度 + 列间距
    ) +
    marginX * 2 // 边框
  const h =
    headerCanvas.height + // 信息栏高度
    rows * spriteHeight + // 快照图高度
    (rows - 1) * paddingY + // 行间距
    (footer ? fontSize + paddingY * 2 : 0) + // 底栏
    marginY * 2 // 边框
  const x0 = marginX
  let y0 = marginY

  canvas.width = w
  canvas.height = h

  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, w, h)

  // 顶栏
  if (header && header.length > 0) {
    ctx.drawImage(headerCanvas, x0, y0)
    y0 += headerCanvas.height
  }

  // 底栏
  if (footer) {
    ctx.font = font
    ctx.fillStyle = textColor
    ctx.textBaseline = 'bottom'
    const generatedAt = `${formatDateTime(new Date())} @ Bilibili-Evolved v${
      meta.compilationInfo.version
    }`
    // 右下角
    ctx.fillText(generatedAt, w - marginX - ctx.measureText(generatedAt).width, h - marginY)
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const i = row * cols + col
      if (i >= snapshots.length) {
        return canvas
      }
      const x = col * (spriteWidth + paddingX) + x0
      const y = row * (spriteHeight + paddingY) + y0
      if (timestamp) {
        drawTimestamp(snapshots[i])
      }
      ctx.drawImage(snapshots[i].canvas, x, y)
    }
  }
  return canvas
}

// =========================================================================== /

/**
 * @author WakelessSloth56
 */
export class VideoSnapshot {
  private ready = false
  aid?: string
  bvid?: string
  cid: number
  times: number[]
  snapshots: SnapshotSprite[]
  spriteSheets: string[]
  spriteColumns: number
  spriteRows: number
  spriteWidth: number
  spriteHeight: number

  private constructor(aid: string, bvid: string, cid: number) {
    this.aid = aid
    this.bvid = bvid
    this.cid = cid
  }

  public static byAid(aid: string, cid: number) {
    return new VideoSnapshot(aid, null, cid)
  }

  public static byBvid(bvid: string, cid: number) {
    return new VideoSnapshot(null, bvid, cid)
  }

  async fetchInfo(toCanvas = false): Promise<VideoSnapshot> {
    let url = 'https://api.bilibili.com/x/player/videoshot?'
    if (this.aid) {
      url += `aid=${this.aid}`
    } else if (this.bvid) {
      url += `bvid=${this.bvid}`
    }
    url += `&cid=${this.cid}`
    const data = await bilibiliApi(getJsonWithCredentials(url))
    const pvData = await fetch(data.pvdata, {})
      .then(res => res.arrayBuffer())
      .then(b => parsePVData(b))
    this.times = pvData
    this.spriteSheets = data.image
    this.spriteColumns = data.img_x_len
    this.spriteRows = data.img_y_len
    this.spriteWidth = data.img_x_size
    this.spriteHeight = data.img_y_size
    this.snapshots = await splitSnapshots(
      this.times,
      this.spriteSheets,
      this.spriteColumns,
      this.spriteRows,
      this.spriteWidth,
      this.spriteHeight,
      toCanvas,
    )
    this.ready = true
    console.debug(this)
    return this
  }

  async createGrid(cols = 5, rows = 6, options: DrawOptions & GridInfoOptions = {}) {
    if (!this.ready || !this.snapshots[0].canvas) {
      throw new Error('[VideoSnapshot] snapshots not ready')
    }

    const canvas = createGrid(
      sampleByTime(this.snapshots, cols * rows),
      cols,
      rows,
      this.spriteWidth,
      this.spriteHeight,
      options,
    )

    return canvas
  }
}
