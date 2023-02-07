import { childListSubtree, videoChange } from '@/core/observer'
import { hasVideo } from '@/core/spin-query'
import { playerAgent } from './player-agent'

export interface DanmakuRecord {
  element: HTMLElement
  reuse: boolean
  text: string
}
export interface DanmakuRecordCallback {
  added?: (danmaku: DanmakuRecord) => void
  removed?: (danmaku: DanmakuRecord) => void
}
const parseDanmakuRecord = (element: HTMLElement) => ({
  element,
  reuse: false,
  text: element.textContent || '',
})
const startRecording = (container: HTMLElement, callback: DanmakuRecordCallback) => {
  const recordedDanmakus: DanmakuRecord[] = []
  childListSubtree(container, records => {
    records.forEach(record => {
      record.addedNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          const element = node.parentElement as HTMLElement
          const danmaku = recordedDanmakus.find(d => d.element === element)
          if (!danmaku) {
            return
          }
          danmaku.text = node.textContent || ''
          danmaku.reuse = true
          callback.added && callback.added(danmaku)
          return
        }
        if (!(node instanceof HTMLElement)) {
          return
        }
        const danmaku = parseDanmakuRecord(node)
        recordedDanmakus.push(danmaku)
        callback.added && callback.added(danmaku)
      })
      record.removedNodes.forEach(node => {
        if (!(node instanceof HTMLElement)) {
          return
        }
        const index = recordedDanmakus.findIndex(d => d.element === node)
        if (index !== -1) {
          const [danmaku] = recordedDanmakus.splice(index, 1)
          callback.removed && callback.removed(danmaku)
        }
      })
    })
  })
}
export const forEachVideoDanmaku = async (callback: DanmakuRecordCallback) => {
  const video = await hasVideo()
  if (!video) {
    return
  }
  videoChange(async () => {
    const container = await playerAgent.query.video.danmaku()
    if (!container) {
      return
    }
    startRecording(container, callback)
  })
}
