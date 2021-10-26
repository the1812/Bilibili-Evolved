import { DanmakuType } from './danmaku-type'

export interface BasicDanmakuData {
  content: string
  time: string
  type: string
  fontSize: string
  color: string
}
export class Danmaku {
  content: string
  time: string
  startTime: number
  type: DanmakuType
  fontSize: number
  color: number
  constructor({
    content, time, type, fontSize, color,
  }: BasicDanmakuData) {
    this.content = content
    this.time = time
    this.startTime = parseFloat(time)
    this.type = parseInt(type)
    this.fontSize = parseFloat(fontSize)
    this.color = parseInt(color)
  }
}
