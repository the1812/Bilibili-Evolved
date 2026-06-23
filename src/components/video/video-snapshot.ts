/* spellchecker:words pvdata */
import { bilibiliApi, getJsonWithCredentials } from '@/core/ajax'

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
 * @author WakelessSloth56
 */
export class VideoSnapshot {
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
    return this
  }
}
