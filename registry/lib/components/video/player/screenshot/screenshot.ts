import { playerAgent } from '@/components/video/player-agent'
import { getFriendlyTitle } from '@/core/utils/title'

const canvas = document.createElement('canvas')
export class Screenshot {
  readonly mimeType = 'image/png'
  url = ''
  blob: Blob
  timeStamp = new Date().getTime()
  constructor(
    public video: HTMLVideoElement,
    public videoTime: number,
    public withDanmaku = false,
  ) {
    this.createUrl()
  }
  async createUrl() {
    const { logError } = await import('@/core/utils/log')
    if (this.withDanmaku) {
      const videoWrapper = dq(playerAgent.query.video.wrap.selector) as HTMLElement
      const rect = videoWrapper.getBoundingClientRect()
      const playerRatio = rect.width / rect.height
      const videoRatio = this.video.videoWidth / this.video.videoHeight
      if (playerRatio >= videoRatio) {
        // 竖屏视频(两侧黑边)
        canvas.height = this.video.videoHeight
        canvas.width = this.video.videoHeight * playerRatio
      } else {
        // 横屏视频(上下黑边)
        canvas.width = this.video.videoWidth
        canvas.height = this.video.videoWidth / playerRatio
      }
    } else {
      canvas.width = this.video.videoWidth
      canvas.height = this.video.videoHeight
    }
    const context = canvas.getContext('2d')
    if (context === null) {
      logError('视频截图失败: canvas 未创建或创建失败.')
      return
    }
    const videoLeft = (canvas.width - this.video.videoWidth) / 2
    const videoTop = (canvas.height - this.video.videoHeight) / 2
    context.drawImage(this.video, videoLeft, videoTop)
    if (this.withDanmaku) {
      const danmakuCanvas = dq(
        'canvas.bilibili-player-video-danmaku, canvas.dm-canvas',
      ) as HTMLCanvasElement
      if (danmakuCanvas !== null) {
        context.drawImage(danmakuCanvas, 0, 0, canvas.width, canvas.height)
      }
    }
    try {
      canvas.toBlob(blob => {
        if (blob === null) {
          logError('视频截图失败: 创建 blob 失败.')
          return
        }
        this.blob = blob
        this.url = URL.createObjectURL(blob)
      }, this.mimeType)
    } catch (error) {
      logError(
        '视频截图失败: 操作被浏览器阻止. 这通常发生于电影的试看片段, 请在正片尝试使用截图功能.',
      )
    }
  }
  get filename() {
    return `${getFriendlyTitle()} @${this.time.replace(/:/g, '-')} ${this.timeStamp.toString()}.png`
  }
  get id() {
    return this.videoTime.toString() + this.timeStamp.toString()
  }
  get time() {
    const hour = Math.trunc(this.videoTime / 3600).toString()
    const minute = Math.trunc(this.videoTime / 60).toString()
    const second = (this.videoTime % 60).toFixed(2)
    if (hour === '0') {
      return `${minute.padStart(2, '0')}:${second.padStart(5, '0')}`
    }
    return `${hour}:${minute.padStart(2, '0')}:${second.padStart(5, '0')}`
  }
  revoke() {
    URL.revokeObjectURL(this.url)
  }
}
export const takeScreenshot = (video: HTMLVideoElement, withDanmaku = false) => {
  const time = video.currentTime
  return new Screenshot(video, time, withDanmaku)
}
