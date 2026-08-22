/**
 * B 站 XML 弹幕解析（合并器专用）
 *
 * 未复用 ../converter/xml-danmaku 的 XmlDanmaku：
 * - XmlDanmaku.parse 使用 element.innerHTML，本模块使用 textContent
 * - 合并器将 p[7] 保留为 dmid 字符串，XmlDanmaku 将其解析为数值 rowId
 */

/** 解析后的单条弹幕 */
export interface ParsedDanmakuItem {
  time: number
  type: number
  color: number
  text: string | null
  size: number
  date: number
  uid: string
  dmid: string
}

/** 将 XML 弹幕字符串解析为合并器可用的对象数组 */
export function parseDanmakuXml(xml: string): ParsedDanmakuItem[] {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xml, 'text/xml')
  const entries = xmlDoc.querySelectorAll('d')
  const danmakuList: ParsedDanmakuItem[] = []

  entries.forEach(entry => {
    const pAttr = entry.getAttribute('p')
    if (!pAttr) {
      return
    }
    const p = pAttr.split(',')
    danmakuList.push({
      time: parseFloat(p[0]),
      type: parseInt(p[1]),
      color: parseInt(p[3]),
      text: entry.textContent,
      size: parseInt(p[2]),
      date: parseInt(p[4]),
      uid: p[6],
      dmid: p[7],
    })
  })

  return danmakuList
}
