import { BasicDanmakuData } from './danmaku-data'

export enum DanmakuType {
  Normal = 1,
  Normal2,
  Normal3,
  Bottom,
  Top,
  Reversed,
  Special,
  Special2
}
export class Danmaku {
  content: string
  time: string
  startTime: number
  type: DanmakuType
  fontSize: number
  color: number
  constructor({ content, time, type, fontSize, color }: BasicDanmakuData) {
    this.content = content
    this.time = time
    this.startTime = parseFloat(time)
    this.type = parseInt(type)
    this.fontSize = parseFloat(fontSize)
    this.color = parseInt(color)
  }
}