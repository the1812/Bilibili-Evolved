export class AudioDownloader {
  progress: (percent: number) => void = null
  sid: number | string
  async getDownloadUrl() {
    const { getJsonWithCredentials } = await import('@/core/ajax')
    const { Toast } = await import('@/core/toast')
    const url = `https://www.bilibili.com/audio/music-service-c/web/url?sid=${this.sid}&privilege=2&quality=2`
    const json = await getJsonWithCredentials(url)
    if (json.code !== 0) {
      Toast.error('获取下载链接失败, 请确保当前账号有下载权限.', '下载音频', 10000)
      return null
    }

    return json.data.cdns.shift()
  }
  async download() {
    const url = await this.getDownloadUrl()
    return new Promise<Blob>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('GET', url)
      xhr.responseType = 'blob'
      xhr.addEventListener('load', () => resolve(xhr.response))
      xhr.addEventListener('error', () => reject(xhr.status))
      xhr.addEventListener('progress', e => this.progress?.((100 * e.loaded) / e.total))
      xhr.send()
    })
  }
}
