export interface DownloadVideoPackageConfig {
  ffmpeg?: boolean
}
export class DownloadVideoPackage {
  entries: {name: string; data: Blob | string}[] = []
  constructor(private config: DownloadVideoPackageConfig = {}) {
  }
  private download(filename: string, blob: Blob) {
    const a = document.createElement('a')
    const url = URL.createObjectURL(blob)
    a.setAttribute('href', url)
    a.setAttribute('download', filename)
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }
  add(name: string, data: string | Blob | null | undefined) {
    if (data === null || data === undefined) {
      return
    }
    this.entries.push({name, data})
  }
  async emit(filename?: string) {
    if (this.entries.length === 0) {
      return
    }
    if (!filename || this.entries.length === 1) {
      filename = this.entries[0].name
    }
    if (this.entries.length === 1) {
      const data = this.entries[0].data
      this.download(filename, typeof data === 'string' ? new Blob([data]) : data)
      return
    }
    const zip = new JSZip()
    this.entries.forEach(({name, data}) => {
      zip.file(name, data)
    })
    const blob = await zip.generateAsync({type: 'blob'})
    this.download(filename, blob)
  }
  static async single(filename: string, data: string | Blob) {
    const pack = new DownloadVideoPackage()
    pack.add(filename, data)
    await pack.emit()
  }
}
export default {
  export: {
    DownloadVideoPackage,
  },
}