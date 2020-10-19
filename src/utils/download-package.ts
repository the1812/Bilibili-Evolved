export interface DownloadPackageConfig {
}
type PackageEntry = { name: string; data: Blob | string }
export class DownloadPackage {
  static lastPackageUrl: string = ''
  entries: PackageEntry[] = []
  constructor(private config: DownloadPackageConfig = {}) {
  }
  private download(filename: string, blob: Blob) {
    const a = document.createElement('a')
    const url = URL.createObjectURL(blob)
    if (DownloadPackage.lastPackageUrl) {
      URL.revokeObjectURL(DownloadPackage.lastPackageUrl)
    }
    DownloadPackage.lastPackageUrl = url
    a.setAttribute('href', url)
    a.setAttribute('download', escapeFilename(filename))
    document.body.appendChild(a)
    a.click()
    a.remove()
  }
  add(name: string, data: string | Blob | null | undefined) {
    if (data === null || data === undefined) {
      return
    }
    console.log(`add file: ${escapeFilename(name)}`)
    this.entries.push({ name: escapeFilename(name), data })
  }
  async blob(): Promise<Blob | null> {
    if (this.entries.length === 0) {
      return null
    }
    if (this.entries.length === 1) {
      const data = this.entries[0].data
      return typeof data === 'string' ? new Blob([data]) : data
    }
    const zip = new JSZip()
    this.entries.forEach(({ name, data }) => {
      zip.file(name, data)
    })
    return await zip.generateAsync({ type: 'blob' })
  }
  async emit(filename?: string) {
    if (this.entries.length === 0) {
      return
    }
    if (!filename || this.entries.length === 1) {
      filename = this.entries[0].name
    }
    const blob = await this.blob()
    if (!blob) {
      return
    }
    return this.download(filename, blob)
  }
  static async single(filename: string, data: string | Blob, config: DownloadPackageConfig = {}) {
    const pack = new DownloadPackage(config)
    pack.add(filename, data)
    return await pack.emit()
  }
}
export default {
  export: {
    DownloadPackage,
  },
}