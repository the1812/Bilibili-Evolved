import { JSZipFileOptions } from '../../@types/jszip/index'

type PackageEntry = { name: string; data: Blob | string, options: JSZipFileOptions }
export class DownloadPackage {
  static lastPackageUrl: string = ''
  entries: PackageEntry[] = []

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
  add(name: string, data: string | Blob | null | undefined, options: JSZipFileOptions = {}) {
    if (data === null || data === undefined) {
      return
    }
    this.entries.push({ name: escapeFilename(name), data, options })
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
    if (settings.downloadPackageEmitMode === '分别下载' && this.entries.length > 1) {
      await Promise.all(this.entries.map(e => DownloadPackage.single(e.name, e.data, e.options)))
      return
    }
    console.log('[DownloadPackage]', {
      filename,
      files: this.entries.map(it => it.name),
    })
    const blob = await this.blob()
    if (!blob) {
      return
    }
    return this.download(filename, blob)
  }
  static async single(filename: string, data: string | Blob, options: JSZipFileOptions = {}) {
    const pack = new DownloadPackage()
    pack.add(filename, data, options)
    return await pack.emit()
  }
}
export default {
  export: {
    DownloadPackage,
  },
}