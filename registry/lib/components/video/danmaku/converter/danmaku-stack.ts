import { fixed } from '@/core/utils'
import { DanmakuType } from './danmaku-type'
import { Resolution, Duration, FontStyles } from './ass-danmaku'
import { Danmaku } from './danmaku-data'

interface TrackItem {
  start: number
  end: number
  trackNumber: number
}
interface HorizontalTrackItem extends TrackItem {
  width: number
  visible: number
}
type Track = TrackItem[]
type TagStack = { tags: string }[]
interface TagData {
  targetTrack: Track
  initTrackNumber: number
  nextTrackNumber: number
  willOverlay: (trackItem: TrackItem, trackNumber: number, width: number) => boolean
  getTrackItem: (trackNumber: number, width: number, visibleTime: number) => TrackItem
  getTag: (info: { trackNumber: number; x: number; y: number }) => string
}

export class DanmakuStack {
  static readonly danmakuType = {
    [DanmakuType.Normal]: 'normal',
    [DanmakuType.Normal2]: 'normal',
    [DanmakuType.Normal3]: 'normal',
    [DanmakuType.Bottom]: 'bottom',
    [DanmakuType.Top]: 'top',
    [DanmakuType.Reversed]: 'reversed',
    [DanmakuType.Special]: 'special',
    [DanmakuType.Special2]: 'special',
  }
  static readonly margin = 4
  static readonly nextDanmakuDelay = 0.05

  horizontalStack: TagStack
  horizontalTrack: Track
  verticalStack: TagStack
  verticalTrack: Track
  resolution: Resolution
  duration: Duration
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  fontSizes: FontStyles
  bottomMarginPercent: number
  danmakuHeight: number
  trackHeight: number
  trackCount: number
  constructor(
    font: string,
    resolution: Resolution,
    duration: Duration,
    bottomMarginPercent: number,
  ) {
    this.horizontalStack = []
    this.horizontalTrack = []
    this.verticalStack = []
    this.verticalTrack = []
    this.resolution = resolution
    this.duration = duration
    this.canvas = document.createElement('canvas')
    this.context = this.canvas.getContext('2d')
    // XML字体大小到实际大小的表
    this.fontSizes = {
      30: `64px ${font}`,
      25: `52px ${font}`,
      18: `36px ${font}`,
      45: `90px ${font}`,
    }

    this.bottomMarginPercent = bottomMarginPercent
    this.generateTracks()
  }
  generateTracks() {
    const height = 52
    this.danmakuHeight = height
    this.trackHeight = DanmakuStack.margin * 2 + height
    this.trackCount = parseInt(
      fixed((this.resolution.y * (1 - this.bottomMarginPercent)) / this.trackHeight, 0),
    )
  }
  getTextSize(danmaku: Danmaku) {
    this.context.font = this.fontSizes[danmaku.fontSize]
    const metrics = this.context.measureText(danmaku.content)
    const x = metrics.width / 2
    return [x, this.danmakuHeight / 2]
  }

  getTags(
    danmaku: Danmaku,
    { targetTrack, initTrackNumber, nextTrackNumber, willOverlay, getTrackItem, getTag }: TagData,
  ) {
    const [x, y] = this.getTextSize(danmaku)
    const width = x * 2
    /*
      x = this.resolution.x = 屏幕宽度
      d = this.duration(danmaku) = 当前弹幕总持续时长(从出现到完全消失)
      w = width = 当前弹幕的宽度
      delay = DanmakuStack.nextDanmakuDelay = 相邻弹幕间最小的时间间隔

      当前弹幕的速度 v = (x + w) / d
      完全进入屏幕所需时间 = visibleTime = delay + w / v = delay + wd / (x + w)
    */
    const visibleTime =
      (this.duration(danmaku) * width) / (this.resolution.x + width) + DanmakuStack.nextDanmakuDelay
    let trackNumber = initTrackNumber
    let overlayDanmaku = null
    // 寻找前面已发送的弹幕中可能重叠的
    const overlayDanmakuInTrack = (it: TrackItem) => willOverlay(it, trackNumber, width)
    do {
      overlayDanmaku = targetTrack.find(overlayDanmakuInTrack)
      trackNumber += nextTrackNumber
    } while (overlayDanmaku && trackNumber <= this.trackCount && trackNumber >= 0)

    // 如果弹幕过多, 此条就不显示了
    if (trackNumber > this.trackCount || trackNumber < 0) {
      return '\\pos(0,-999)'
    }
    trackNumber -= nextTrackNumber // 减回最后的自增
    targetTrack.push(getTrackItem(trackNumber, width, visibleTime))
    return getTag({ trackNumber, x, y })
  }
  getHorizontalTags(danmaku: Danmaku) {
    return this.getTags(danmaku, {
      targetTrack: this.horizontalTrack,
      initTrackNumber: 0,
      nextTrackNumber: 1,
      willOverlay: (it: HorizontalTrackItem, trackNumber, width) => {
        if (it.trackNumber !== trackNumber) {
          // 不同轨道当然不会重叠
          return false
        }
        if (it.width < width) {
          // 弹幕比前面的弹幕长, 必须等前面弹幕走完
          /*
            x = this.resolution.x = 屏幕宽度
            d = this.duration(danmaku) = 当前弹幕总持续时长(从出现到完全消失)
            w = width = 当前弹幕的宽度
            end = it.end = 前面的弹幕结束时间点
            start = danmaku.startTime = 当前弹幕的开始时间点

            当前弹幕的速度 v = (x + w) / d
            当前弹幕碰到左侧边缘需要的时间 ▲t = x / v = dx / (x + w)
            当前弹幕碰到左侧边缘的时间点 t = ▲t + start

            如果会重叠, 则当前弹幕碰到左边缘时, 前面的弹幕还未结束
            即 t <= end
            也就是 start + dx / (x + w) <= end 或 dx / (x + w) <= end - start
          */
          return (
            (this.duration(danmaku) * this.resolution.x) / (this.resolution.x + width) <=
            it.end - danmaku.startTime
          )
        } // 前面弹幕完全进入屏幕的时间点晚于当前弹幕的开始时间, 就一定会重叠
        return it.visible > danmaku.startTime
      },
      getTrackItem: (trackNumber, width, visibleTime) =>
        ({
          width,
          start: danmaku.startTime,
          visible: danmaku.startTime + visibleTime,
          end: danmaku.startTime + this.duration(danmaku),
          trackNumber,
        } as HorizontalTrackItem),
      getTag: ({ trackNumber, x, y }) =>
        `\\move(${this.resolution.x + x},${
          trackNumber * this.trackHeight + DanmakuStack.margin + y
        },${-x},${trackNumber * this.trackHeight + DanmakuStack.margin + y},0,${
          this.duration(danmaku) * 1000
        })`,
    })
  }
  getVerticalTags(danmaku: Danmaku) {
    const isTop = DanmakuStack.danmakuType[danmaku.type] === 'top'
    return this.getTags(danmaku, {
      targetTrack: this.verticalTrack,
      initTrackNumber: isTop ? 0 : this.trackCount - 1,
      nextTrackNumber: isTop ? 1 : -1,
      willOverlay: (it, trackNumber) => {
        if (it.trackNumber !== trackNumber) {
          return false
        }
        return it.end > danmaku.startTime
      },
      getTrackItem: trackNumber => ({
        start: danmaku.startTime,
        end: danmaku.startTime + this.duration(danmaku),
        trackNumber,
      }),
      getTag: ({ trackNumber, y }) => {
        if (isTop) {
          return `\\pos(${this.resolution.x / 2},${
            trackNumber * this.trackHeight + DanmakuStack.margin + y
          })`
        }
        return `\\pos(${this.resolution.x / 2},${
          this.resolution.y -
          DanmakuStack.margin -
          y -
          (this.trackCount - 1 - trackNumber) * this.trackHeight
        })`
      },
    })
  }
  push(danmaku: Danmaku) {
    let tags = ''
    let stack: { tags: string }[] = []
    switch (DanmakuStack.danmakuType[danmaku.type]) {
      case 'normal':
      case 'reversed': {
        // 反向先鸽了, 直接当正向了
        tags = this.getHorizontalTags(danmaku)
        stack = this.horizontalStack
        break
      }
      case 'top':
      case 'bottom': {
        tags = this.getVerticalTags(danmaku)
        stack = this.verticalStack
        break
      }
      case 'special': // 高级弹幕也鸽了先
      default: {
        return {
          tags: '\\pos(0,-999)',
        }
      }
    }
    const info = {
      tags,
    }
    stack.push(info)
    return info
  }
}
