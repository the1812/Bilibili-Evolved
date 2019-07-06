import { XmlDanmaku, XmlDanmakuDocument } from './xml-danmaku'
import { Duration, BlockTypes, Resolution, AssDanmaku, AssDanmakuDocument } from './ass-danmaku'
import { DanmakuStack } from './danmaku-stack'
import { Danmaku, DanmakuType } from './danmaku'

export interface DanmakuConverterConfig {
  title: string
  font: string
  alpha: number
  bold: boolean
  duration: Duration
  blockTypes: BlockTypes
  resolution: Resolution
  bottomMarginPercent: number
}
export const getDefaultDanmakuConverterConfig = (title: string): DanmakuConverterConfig => {
  return {
    title,
    font: "微软雅黑",
    alpha: 0.6,
    duration: (danmaku: Danmaku) => {
      switch (danmaku.type) {
        case DanmakuType.Bottom:
        case DanmakuType.Top:
          return 4;
        default:
          return 6;
      }
    },
    blockTypes: [DanmakuType.Special, DanmakuType.Special2],
    resolution: {
      x: 1920,
      y: 1080,
    },
    bottomMarginPercent: 0.15,
    bold: false,
  }
}
export class DanmakuConverter {
  static white = 16777215 // Dec color of white danmaku
  title: string
  font: string
  alpha: string
  duration: Duration
  blockTypes: BlockTypes
  resolution: Resolution
  bold: boolean
  danmakuStack: DanmakuStack
  constructor({ title, font, alpha, duration, blockTypes, resolution, bottomMarginPercent, bold }: DanmakuConverterConfig) {
    this.title = title
    this.font = font
    this.alpha = Math.round(alpha * 100).toString(16).toUpperCase()
    this.duration = duration
    this.blockTypes = blockTypes
    this.resolution = resolution
    this.bold = bold
    this.danmakuStack = new DanmakuStack(font, resolution, duration, bottomMarginPercent)
  }
  get fontStyles() {
    return {
      30: `Style: Large,${this.font},64,&H${this.alpha}FFFFFF,&H${this.alpha}FFFFFF,&H${this.alpha}000000,&H${this.alpha}000000,${this.bold ? '1' : '0'},0,0,0,100,100,0,0,1,1.2,0,5,0,0,0,0`,
      25: `Style: Medium,${this.font},52,&H${this.alpha}FFFFFF,&H${this.alpha}FFFFFF,&H${this.alpha}000000,&H${this.alpha}000000,${this.bold ? '1' : '0'},0,0,0,100,100,0,0,1,1.2,0,5,0,0,0,0`,
      18: `Style: Small,${this.font},36,&H${this.alpha}FFFFFF,&H${this.alpha}FFFFFF,&H${this.alpha}000000,&H${this.alpha}000000,${this.bold ? '1' : '0'},0,0,0,100,100,0,0,1,1.2,0,5,0,0,0,0`
    }
  }
  convertToAssDocument(xml: string) {
    const xmlDanmakuDocument = new XmlDanmakuDocument(xml)
    const assDanmakus = []
    for (const xmlDanmaku of xmlDanmakuDocument.danmakus.sort((a, b) => a.startTime - b.startTime)) {
      // 跳过设置为屏蔽的弹幕类型
      if (this.blockTypes.indexOf(xmlDanmaku.type) !== -1 ||
        this.blockTypes.indexOf('color') !== -1 && xmlDanmaku.color !== DanmakuConverter.white) {
        continue
      }
      const [startTime, endTime] = this.convertTime(xmlDanmaku.startTime, this.duration(xmlDanmaku))
      assDanmakus.push(new AssDanmaku({
        content: this.convertText(xmlDanmaku.content),
        time: startTime,
        endTime: endTime,
        type: xmlDanmaku.type.valueOf().toString(),
        fontSize: xmlDanmaku.fontSize.toString(),
        color: xmlDanmaku.color.toString(),
        typeTag: this.convertType(xmlDanmaku),
        colorTag: this.convertColor(xmlDanmaku.color)
      }))
    }
    return new AssDanmakuDocument(
      assDanmakus,
      this.title,
      this.fontStyles,
      this.blockTypes,
      this.resolution
    )
  }
  convertText(text: string) {
    const map = {
      '{': '｛',
      '}': '｝',
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&apos;': "'"
    }
    for (const [key, value] of Object.entries(map)) {
      text = text.replace(new RegExp(key, 'g'), value)
    }
    return text
  }
  convertType(danmaku: Danmaku) {
    return this.danmakuStack.push(danmaku).tags
  }
  convertColor(decColor: number) {
    if (decColor === DanmakuConverter.white) {
      return ''
    }
    const hex = decColor.toString(16)
    const red = hex.substring(0, 2)
    const green = hex.substring(2, 4)
    const blue = hex.substring(4, 6)
    return `\\c&H${blue}${green}${red}&`
  }
  convertTime(startTime: number, duration: number) {
    function round(number: number) {
      const [integer, decimal = '00'] = String(number).split('.')
      return `${integer.padStart(2, '0')}.${decimal.substr(0, 2).padEnd(2, '0')}`
    }
    function secondsToTime(seconds: number) {
      let hours = 0
      let minutes = 0
      while (seconds >= 60) {
        seconds -= 60
        minutes++
      }
      while (minutes >= 60) {
        minutes -= 60
        hours++
      }
      return `${hours}:${String(minutes).padStart(2, '0')}:${round(seconds)}`
    }
    return [secondsToTime(startTime), secondsToTime(startTime + duration)]
  }
}
export default {
  export: {
    AssDanmaku,
    AssDanmakuDocument,
    Danmaku,
    DanmakuConverter,
    DanmakuStack,
    XmlDanmaku,
    XmlDanmakuDocument
  }
}
