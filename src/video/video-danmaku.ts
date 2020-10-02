let danmakuContainerObserver: Observer
export interface DanmakuRecord {
  element: HTMLElement
  reuse: boolean
  text: string
}
export interface DanmakuRecordCallback {
  added?: (danmaku: DanmakuRecord) => void
  removed?: (danmaku: DanmakuRecord) => void
}
const recordedDanmakus: DanmakuRecord[] = []
const parseDanmakuRecord = (element: HTMLElement) => {
  return {
    element,
    reuse: false,
    text: element.textContent || '',
  }
}
const startRecording = (container: HTMLElement, callback: DanmakuRecordCallback) => {
  if (danmakuContainerObserver) {
    danmakuContainerObserver.stop()
  }
  danmakuContainerObserver = Observer.observe(container, records => {
    records.forEach(record => {
      if (record.type === 'childList') {
        record.addedNodes.forEach(node => {
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
      } else if (record.type === 'characterData') {
        const element = record.target as HTMLElement
        const danmaku = recordedDanmakus.find(d => d.element === element)
        if (!danmaku) {
          return
        }
        danmaku.text = element.textContent || ''
        danmaku.reuse = true
        callback.added && callback.added(danmaku)
      }
    })
  }, { childList: true, characterData: true, subtree: true })
}
export const forEachVideoDanmaku = async (callback: DanmakuRecordCallback) => {
  const hasVideo = await videoCondition()
  if (!hasVideo) {
    return
  }
  Observer.videoChange(async () => {
    const container = await SpinQuery.select('.bilibili-player-video-danmaku') as HTMLElement
    if (!container) {
      return
    }
    startRecording(container, callback)
  })
}
export default {
  export: {
    forEachVideoDanmaku,
  },
}
