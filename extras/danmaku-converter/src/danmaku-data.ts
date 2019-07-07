export interface BasicDanmakuData {
  content: string
  time: string
  type: string
  fontSize: string
  color: string
}
export interface XmlDanmakuData extends BasicDanmakuData {
  timeStamp: string
  pool: string
  userHash: string
  rowId: string
  time: string
}
export interface AssDanmakuData extends BasicDanmakuData {
  typeTag: string
  colorTag: string
  endTime: string
}