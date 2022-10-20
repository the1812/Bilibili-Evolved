/** 处理视频缩略图的 style */
export class Videoshot {
  aid = unsafeWindow.aid
  cid = unsafeWindow.cid
  viewWidth = 120
  viewHeight = 70
  cidData = null
  blocked = false
  workingPromise: Promise<any> = null
  /** 获取特点时间点的缩略图 style */
  async getVideoshot(currentTime: number): Promise<Partial<CSSStyleDeclaration>> {
    if (!(this.aid && this.cid) || this.blocked) {
      return null
    }
    if (this.workingPromise) {
      return this.workingPromise
    }
    const { getJson } = await import('@/core/ajax')
    if (!this.cidData) {
      this.workingPromise = getJson(
        `https://api.bilibili.com/x/player/videoshot?aid=${this.aid}&cid=${this.cid}&index=1`,
      )
      const json = await this.workingPromise
      this.workingPromise = null
      if (json.code === -412) {
        // 请求被拦截, 应停止访问
        this.blocked = true
        return null
      }
      this.cidData = json.data
      return this.getVideoshot(currentTime)
    }
    const data = this.cidData
    const indexData = data.index
    // 缩略图 index 是从 1 开始的
    let shotIndex = 1
    for (let index = indexData.length - 1; index > 0; index--) {
      if (currentTime >= indexData[index]) {
        shotIndex = index
        break
      }
    }

    const imageData = data.image as string[]
    if (imageData === null) {
      return null
    }
    const xLength = data.img_x_len ?? 10
    const yLength = data.img_y_len ?? 10
    const xScale = xLength * this.viewWidth
    const yScale = yLength * this.viewHeight
    // const xSize = data.img_x_size ?? 120
    // const ySize = data.img_y_size ?? 70
    const xSize = this.viewWidth
    const ySize = this.viewHeight
    const x = -(((shotIndex - 1) % 100) % xLength) * xSize
    const y = -Math.floor(((shotIndex - 1) % 100) / yLength) * ySize
    return {
      // width: xSize,
      // height: ySize,
      backgroundImage: `url(${imageData[Math.floor(shotIndex / 100)]})`,
      backgroundPosition: `${x}px ${y}px`,
      backgroundSize: `${xScale}px ${yScale}px`,
    }
  }
}
