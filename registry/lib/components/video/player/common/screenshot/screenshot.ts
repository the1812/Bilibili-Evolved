import { playerAgent } from '@/components/video/player-agent'
import { formatDuration } from '@/core/utils/formatters'
import { getFriendlyTitle } from '@/core/utils/title'

export const ScreenshotDisabledClass = 'screenshot-disable'

const canvas = document.createElement('canvas')

export class Screenshot {
  readonly mimeType = 'image/png'
  url = ''
  blob: Blob
  timeStamp = new Date().getTime()
  /**
   * @param video 截图来源的视频元素
   * @param videoTime 视频时间点, 仅用于生成截图 ID
   * @param withDanmaku 是否将弹幕一并截入图片 (仅视频页面支持)
   * @param time 截图上显示的时间文本, 默认为视频时间点
   */
  constructor(
    public video: HTMLVideoElement,
    public videoTime: number,
    public withDanmaku = false,
    public time = formatDuration(videoTime, 2),
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
  revoke() {
    URL.revokeObjectURL(this.url)
  }
}
export const takeScreenshot = (video: HTMLVideoElement, withDanmaku = false) => {
  const time = video.currentTime
  return new Screenshot(video, time, withDanmaku)
}
