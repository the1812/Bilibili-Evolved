import { playerAgent } from '@/components/video/player-agent'
import { monkey } from '@/core/ajax'
import { parseAirborneTime } from './airborne-time'

export interface AirborneDanmakuItem {
  /** 弹幕出现时间, 单位秒 */
  time: number
  /** 原始弹幕文本 */
  text: string
  /** 从文本中预先解析出的空降时间 */
  airborneSeconds: number[]
}

/** 从播放器 manifest 读取当前视频 cid, 兼容旧布局的 unsafeWindow.cid */
export const getPlayerCid = (): number | null => {
  const manifest = playerAgent.nativeApi?.getManifest?.()
  const cid = manifest?.cid ?? unsafeWindow.cid
  return typeof cid === 'number' ? cid : null
}

/** 通过官方 XML 接口获取并筛选包含空降时间的弹幕 */
export const fetchAirborneDanmaku = async (cid: number): Promise<AirborneDanmakuItem[]> => {
  const xml = await monkey<string>({
    url: `https://comment.bilibili.com/${cid}.xml`,
    method: 'GET',
    responseType: 'text',
    anonymous: false,
  })
  if (!xml) {
    throw new Error('弹幕接口返回为空')
  }
  const xmlDocument = new DOMParser().parseFromString(xml, 'text/xml')
  const items: AirborneDanmakuItem[] = []
  xmlDocument.querySelectorAll('d').forEach(entry => {
    const p = entry.getAttribute('p')
    const text = entry.textContent ?? ''
    if (!p || !text) {
      return
    }
    const time = parseFloat(p.split(',')[0])
    const airborneSeconds = parseAirborneTime(text)
    if (!Number.isNaN(time) && airborneSeconds.length > 0) {
      items.push({ time, text, airborneSeconds })
    }
  })
  return items
}
