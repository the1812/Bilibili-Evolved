import { escapeContent } from '@/components/video/xml-utils'
import { BasicDanmakuData, Danmaku } from './danmaku-data'

export interface XmlDanmakuData extends BasicDanmakuData {
  timeStamp: string
  pool: string
  userHash: string
  rowId: string
  time: string
}
export class XmlDanmaku extends Danmaku {
  timeStamp: number
  pool: number
  userHash: string
  rowId: number
  pDataArray: Array<number | string>
  constructor({
    content,
    time,
    type,
    fontSize,
    color,
    timeStamp,
    pool,
    userHash,
    rowId,
  }: XmlDanmakuData) {
    super({
      content,
      time,
      type,
      fontSize,
      color,
    })
    this.timeStamp = parseInt(timeStamp)
    this.pool = parseInt(pool)
    this.userHash = userHash
    this.rowId = parseInt(rowId)
    this.pDataArray = [time, type, fontSize, color, timeStamp, pool, userHash, rowId]
  }
  text() {
    const pData = this.pDataArray.join(',')
    return `<d p="${pData}">${escapeContent(this.content)}</d>`
  }
  static parse(element: Element) {
    const pData = element.getAttribute('p')
    const [time, type, fontSize, color, timeStamp, pool, userHash, rowId] = pData.split(',')
    const content = element.innerHTML
    return new XmlDanmaku({
      content,
      time,
      type,
      fontSize,
      color,
      timeStamp,
      pool,
      userHash,
      rowId,
    })
  }
}
export class XmlDanmakuDocument {
  xml: string
  danmakus: XmlDanmaku[]
  constructor(xml: string) {
    this.xml = xml
    const document = new DOMParser().parseFromString(xml, 'application/xml').documentElement
    this.danmakus = [...document.querySelectorAll('d[p]')].map(it => XmlDanmaku.parse(it))
  }
}
