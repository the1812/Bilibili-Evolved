import {
  Duration, BlockTypes, AssDanmaku, AssDanmakuDocument, Resolution,
} from './ass-danmaku'
import { Danmaku } from './danmaku-data'
import { XmlDanmakuDocument, XmlDanmaku } from './xml-danmaku'
import { DanmakuStack } from './danmaku-stack'

/* eslint-disable */
export interface DanmakuConverterConfig {
  title: string
  font: string
  alpha: number
  bold: boolean
  duration: Duration
  blockTypes: BlockTypes
  resolution: Resolution
  bottomMarginPercent: number
  blockFilter?: (danmaku: XmlDanmaku) => boolean
}
export class DanmakuConverter {
  static white = 16777215 // Dec color of white danmaku
  title: string
  font: string
  alpha: string
  duration: Duration
  blockTypes: BlockTypes
  blockFilter: (danmaku: XmlDanmaku) => boolean
  resolution: Resolution
  bold: boolean
  danmakuStack: DanmakuStack
  constructor({
    title, font, alpha, duration, blockTypes, blockFilter, resolution, bottomMarginPercent, bold,
  }: DanmakuConverterConfig) {
    this.title = title
    this.font = font
    this.alpha = Math.round(alpha * 255).toString(16).toUpperCase().padStart(2, '0')
    this.duration = duration
    this.blockTypes = blockTypes
    this.blockFilter = blockFilter || (() => true)
    this.resolution = resolution
    this.bold = bold
    this.danmakuStack = new DanmakuStack(font, resolution, duration, bottomMarginPercent)
  }
  get fontStyles() {
    return {
      36: `Style: Larger,${this.font},72,&H${this.alpha}FFFFFF,&H${this.alpha}FFFFFF,&H${this.alpha}000000,&H${this.alpha}000000,${this.bold ? '1' : '0'},0,0,0,100,100,0,0,1,1.2,0,5,0,0,0,0`,
      30: `Style: Large,${this.font},64,&H${this.alpha}FFFFFF,&H${this.alpha}FFFFFF,&H${this.alpha}000000,&H${this.alpha}000000,${this.bold ? '1' : '0'},0,0,0,100,100,0,0,1,1.2,0,5,0,0,0,0`,
      25: `Style: Medium,${this.font},52,&H${this.alpha}FFFFFF,&H${this.alpha}FFFFFF,&H${this.alpha}000000,&H${this.alpha}000000,${this.bold ? '1' : '0'},0,0,0,100,100,0,0,1,1.2,0,5,0,0,0,0`,
      18: `Style: Small,${this.font},36,&H${this.alpha}FFFFFF,&H${this.alpha}FFFFFF,&H${this.alpha}000000,&H${this.alpha}000000,${this.bold ? '1' : '0'},0,0,0,100,100,0,0,1,1.2,0,5,0,0,0,0`,
      45: `Style: ExtraLarge,${this.font},90,&H${this.alpha}FFFFFF,&H${this.alpha}FFFFFF,&H${this.alpha}000000,&H${this.alpha}000000,${this.bold ? '1' : '0'},0,0,0,100,100,0,0,1,1.2,0,5,0,0,0,0`,
    }
  }
  xmlDanmakuToAssDocument(xmlDanmakus: XmlDanmaku[]) {
    const assDanmakus = []
    for (const xmlDanmaku of xmlDanmakus) {
      // 跳过设置为屏蔽的弹幕类型
      if (this.blockTypes.indexOf(xmlDanmaku.type) !== -1 ||
        this.blockTypes.indexOf('color') !== -1 && xmlDanmaku.color !== DanmakuConverter.white) {
        continue
      }
      // 应用传入的过滤器
      if (!this.blockFilter(xmlDanmaku)) {
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
  xmlStringToAssDocument(xml: string) {
    const xmlDanmakuDocument = new XmlDanmakuDocument(xml)
    return this.xmlDanmakuToAssDocument(xmlDanmakuDocument.danmakus.sort((a, b) => a.startTime - b.startTime))
  }
  convertText(text: string) {
    const map = {
      '{': '｛',
      '}': '｝',
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&apos;': "'",
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
