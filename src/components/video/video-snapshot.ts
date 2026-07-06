/* spellchecker:words pvdata */
import { bilibiliApi, getJsonWithCredentials } from '@/core/ajax'
import { formatDuration } from '@/core/utils/formatters'

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

export interface SnapshotTile {
  time: number
  column: number
  row: number
  x: number
  y: number
  width: number
  height: number
  atlas: SnapshotAtlas
  canvas?: HTMLCanvasElement
}

export interface SnapshotTileWithCanvas extends SnapshotTile {
  canvas: HTMLCanvasElement
}

export interface SnapshotAtlas {
  index: number
  url: string
  width: number
  height: number
  columns: number
  rows: number
  tiles: SnapshotTile[]
  image?: CanvasImageSource
}

/**
 * @author WakelessSloth56
 */
function parseTiles(
  atlas: SnapshotAtlas,
  times: number[],
  columns: number,
  rows: number,
  width: number,
  height: number,
) {
  const s: SnapshotTile[] = []
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const i = row * columns + column
      if (i >= times.length) {
        return s
      }
      const x = column * width
      const y = row * height
      s.push({
        atlas,
        time: times[i],
        x,
        y,
        width,
        height,
        column,
        row,
      })
    }
  }
  return s
}

/**
 * @author WakelessSloth56
 */
async function parseAtlases(
  allTimes: number[],
  atlasUrls: string[],
  columns: number,
  rows: number,
  tileWidth: number,
  tileHeight: number,
) {
  const atlases = lodash.zip(atlasUrls, lodash.chunk(allTimes, columns * rows))
  return atlases.map(([url, times], index) => {
    const atlas: SnapshotAtlas = {
      index,
      url,
      rows,
      columns,
      width: columns * tileWidth,
      height: rows * tileHeight,
      tiles: [],
    }
    const tiles = parseTiles(atlas, times, columns, rows, tileWidth, tileHeight)
    atlas.tiles = tiles
    return atlas
  })
}

/**
 * @author WakelessSloth56
 */
async function loadAtlasImage(atlas: SnapshotAtlas) {
  return new Promise((resolve: (atlas: SnapshotAtlas) => void, reject) => {
    if (atlas.image) {
      resolve(atlas)
    } else {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        atlas.image = img
        resolve(atlas)
      }
      img.onerror = reject
      img.src = atlas.url
    }
  })
}

/**
 * @author WakelessSloth56
 */
async function splitTileImage(tile: SnapshotTile) {
  if (tile.canvas) {
    return tile as SnapshotTileWithCanvas
  }
  if (!tile.atlas.image) {
    throw new Error('[VideoSnapshot] snapshot atlas not loaded')
  }
  const canvas = document.createElement('canvas')
  canvas.width = tile.width
  canvas.height = tile.height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(
    tile.atlas.image,
    tile.x,
    tile.y,
    tile.width,
    tile.width,
    0,
    0,
    tile.width,
    tile.width,
  )
  tile.canvas = canvas
  return tile as SnapshotTileWithCanvas
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
  fontFamily?: string
  textColor?: string
  backgroundColor?: string
  paddingX?: number
  paddingY?: number
  marginX?: number
  marginY?: number
}

export interface GridInfoOptions {
  header?: string[]
  footer?: string[]
  timestamp?: boolean
}

function calcTextWidth(ctx: CanvasText, text?: string[]) {
  if (text && text.length > 0) {
    const w = lodash.max(text.map(s => ctx.measureText(s).width))
    return w
  }
  return 0
}

function drawText(ctx: CanvasText, text: string[], x: number, y0: number, lineHeight: number) {
  for (let i = 0; i < text.length; i++) {
    const y = i * lineHeight + y0
    ctx.fillText(text[i], x, y)
  }
}

/**
 * 在快照图上绘制对应的时间点
 * @author WakelessSloth56
 */
function drawTimestamp(snapshot: SnapshotTileWithCanvas, options: DrawOptions = {}) {
  const timeStr = formatDuration(snapshot.time)
  const ctx = snapshot.canvas.getContext('2d')

  const {
    paddingX = 8,
    paddingY = 4,
    marginX = 2,
    marginY = 2,
    fontSize = 22,
    fontFamily = 'monospace',
    textColor = '#ffffff',
    backgroundColor = 'rgba(0,0,0,0.5)',
  } = options

  ctx.font = `${fontSize}px ${fontFamily}`
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
  tiles: SnapshotTileWithCanvas[],
  cols: number,
  rows: number,
  tileWidth: number,
  tileHeight: number,
  options: DrawOptions & GridInfoOptions = {},
) {
  const {
    paddingX = 4,
    paddingY = 4,
    marginX = 12,
    marginY = 12,
    fontSize = 22,
    fontFamily: fontName = 'monospace',
    textColor = '#ffffff',
    backgroundColor = '#000000',
    header = [],
    footer = [],
    timestamp = true,
  } = options
  const font = `${fontSize}px ${fontName}`
  const lineHeight = fontSize + paddingY

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  ctx.font = font
  const headerW = calcTextWidth(ctx, header)
  const headerH = headerW ? header.length * fontSize + header.length * paddingY + paddingY : 0

  const gridW = cols * tileWidth + (cols - 1) * paddingX
  const gridH = rows * tileHeight + (rows - 1) * paddingY

  const footerW = calcTextWidth(ctx, footer)
  const footerH = footerW ? footer.length * fontSize + footer.length * paddingY + paddingY : 0

  const w = Math.max(headerW, gridW, footerW) + marginX * 2 // 防止超长标题溢出
  const h = headerH + gridH + footerH + marginY * 2
  canvas.width = w
  canvas.height = h

  const headerX = marginX
  const headerY = marginY

  const gridX = (w - gridW) / 2 // 图片网格居中
  const gridY = headerY + headerH

  const footerX = w - marginX
  const footerY = gridY + gridH + paddingY * 2

  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, w, h)

  ctx.font = font
  ctx.textBaseline = 'top'
  ctx.fillStyle = textColor

  if (headerW) {
    ctx.textAlign = 'left'
    drawText(ctx, header, headerX, headerY, lineHeight)
  }

  if (footerW) {
    ctx.textAlign = 'right'
    drawText(ctx, footer, footerX, footerY, lineHeight)
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const i = row * cols + col
      if (i >= tiles.length) {
        return canvas
      }
      if (timestamp) {
        drawTimestamp(tiles[i])
      }
      const x = col * (tileWidth + paddingX) + gridX
      const y = row * (tileHeight + paddingY) + gridY
      ctx.drawImage(tiles[i].canvas, x, y)
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
  atlases: SnapshotAtlas[]
  atlasColumns: number
  atlasRows: number
  tileWidth: number
  tileHeight: number

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

  async fetchInfo() {
    let url = 'https://api.bilibili.com/x/player/videoshot?'
    if (this.aid) {
      url += `aid=${this.aid}`
    } else if (this.bvid) {
      url += `bvid=${this.bvid}`
    }
    url += `&cid=${this.cid}`
    const data = await bilibiliApi(getJsonWithCredentials(url), '[VideoSnapshot]', false)

    const allTimes = await fetch(data.pvdata, {})
      .then(res => res.arrayBuffer())
      .then(b => parsePVData(b))

    this.atlasColumns = data.img_x_len
    this.atlasRows = data.img_y_len
    this.tileWidth = data.img_x_size
    this.tileHeight = data.img_y_size

    this.atlases = await parseAtlases(
      allTimes,
      data.image,
      this.atlasColumns,
      this.atlasRows,
      this.tileWidth,
      this.tileHeight,
    )

    this.ready = true
    console.debug(this)
    return this
  }

  checkReady() {
    if (!this.ready) {
      throw new Error('[VideoSnapshot] snapshots not ready')
    }
  }

  get snapshots(): SnapshotTile[] {
    this.checkReady()
    return this.atlases.flatMap(x => x.tiles)
  }

  async loadAtlasImage() {
    this.checkReady()
    await Promise.all(this.atlases.map(loadAtlasImage))
    return this
  }

  async createGrid(cols = 5, rows = 6, options: DrawOptions & GridInfoOptions = {}) {
    await this.loadAtlasImage()
    const tiles = await Promise.all(this.sampleByTime(cols * rows).map(splitTileImage))
    return createGrid(tiles, cols, rows, this.tileWidth, this.tileHeight, options)
  }

  sampleByTime(count: number) {
    return sampleByTime(this.snapshots, count)
  }

  getByTime(time: number) {
    this.checkReady()
    for (const atlas of this.atlases) {
      for (const tile of atlas.tiles) {
        if (time >= tile.time) {
          return tile
        }
      }
    }
    return null
  }

  static async loadAtlasImage(atlas: SnapshotAtlas) {
    return loadAtlasImage(atlas)
  }

  static async loadTileImage(tile: SnapshotTile) {
    return loadAtlasImage(tile.atlas).then(() => splitTileImage(tile))
  }
}
