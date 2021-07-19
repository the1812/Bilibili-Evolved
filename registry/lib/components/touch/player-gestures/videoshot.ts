/** 处理视频缩略图的style */
export class Videoshot {
  aid = unsafeWindow.aid
  cid = unsafeWindow.cid
  cidData = null
  blocked = false
  workingPromise: Promise<any> = null
  /** 获取特点时间点的缩略图style */
  async getVideoshot(currentTime: number): Promise<{
    width: number
    height: number
    backgroundImage: string
    backgroundPosition: string
  }> {
    if (!(this.aid && this.cid) || this.blocked) {
      return null
    }
    if (this.workingPromise) {
      return this.workingPromise
    }
    const { getJson } = await import('@/core/ajax')
    if (!this.cidData) {
      this.workingPromise = getJson(`https://api.bilibili.com/x/player/videoshot?aid=${this.aid}&cid=${this.cid}&index=1`)
      const json = await this.workingPromise
      this.workingPromise = null
      if (json.code === -412) { // 请求被拦截, 应停止访问
        this.blocked = true
        return null
      }
      this.cidData = json.data
      return this.getVideoshot(currentTime)
    }
    const data = this.cidData
    const indexData = data.index
    let shotIndex = 0
    for (let index = 0; index < indexData.length - 2; index++) {
      if (currentTime >= indexData[index]
          && currentTime < indexData[index + 1]) {
        shotIndex = index
        break
      }
    }

    let imageData = data.image as string[]
    if (imageData === null) {
      return null
    }
    if (Videoshot.supportWebp) {
      imageData = imageData.map(url => url.replace('.jpg', '.jpg@.webp'))
    }
    const xLength = parseInt(data.pv_x_len) || 10
    const yLength = parseInt(data.pv_y_len) || 10
    const xSize = parseInt(data.pv_x_size) || 160
    const ySize = parseInt(data.pv_y_size) || 90
    const x = -(shotIndex % 100 % xLength) * xSize
    const y = -Math.floor((shotIndex % 100) / yLength) * ySize
    return {
      width: xSize,
      height: ySize,
      backgroundImage: `url(${imageData[Math.floor(shotIndex / 100)]})`,
      backgroundPosition: `${x}px ${y}px`,
    }
  }
  static get supportWebp() {
    try {
      const canvas = document.createElement('canvas')
      if (canvas.getContext && canvas.getContext('2d')) {
        try {
          return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
        } catch (ex) {
          return false
        }
      } else { return false }
    } catch (ex) {
      return false
    }
  }
}
