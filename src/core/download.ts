import { JSZipFileOptions } from 'jszip'
import { DownloadPackageEmitMode } from './download-mode'
import { getGeneralSettings } from './settings'
import { formatFilename } from './utils/formatters'

/** 表示`DownloadPackage`中的一个文件 */
export interface PackageEntry {
  /** 文件名 */
  name: string
  /** 文件内容 */
  data: Blob | string
  /** 其他文件属性 */
  options: JSZipFileOptions
}
/** 打包下载多个文件 */
export class DownloadPackage {
  static lastPackageUrl = ''
  constructor(
    /** 已添加的文件 */
    public entries: PackageEntry[] = [],
  ) {}
  /**
   * 添加文件
   * @param name 文件名
   * @param data 文件内容
   */
  add(name: string, data: string | Blob, options: JSZipFileOptions = {}) {
    if (data === null || data === undefined) {
      return
    }
    this.entries.push({ name: formatFilename(name), data, options })
  }
  /** 获取打包后的Blob数据 */
  async blob(): Promise<Blob | null> {
    if (this.entries.length === 0) {
      return null
    }
    if (this.entries.length === 1) {
      const { data } = this.entries[0]
      return typeof data === 'string' ? new Blob([data]) : data
    }
    const zip = new JSZip()
    this.entries.forEach(({ name, data, options }) => {
      zip.file(name, data, options)
    })
    return zip.generateAsync({ type: 'blob' })
  }
  /**
   * 触发浏览器下载, 若只有一个文件则不会打包, 而是直接下载此文件
   * @param filename 打包后的文件名, 省略则使用第一个文件的文件名
   */
  async emit(filename?: string) {
    if (this.entries.length === 0) {
      return
    }
    if (!filename || this.entries.length === 1) {
      filename = this.entries[0].name
    }
    const isIndividualMode = (
      getGeneralSettings().downloadPackageEmitMode === DownloadPackageEmitMode.individual
    )
    if (isIndividualMode && this.entries.length > 1) {
      await Promise.all(this.entries.map(e => DownloadPackage.single(e.name, e.data, e.options)))
      return
    }
    const blob = await this.blob()
    if (!blob) {
      return
    }
    DownloadPackage.download(filename, blob)
  }
  private static download(filename: string, blob: Blob) {
    const a = document.createElement('a')
    const url = URL.createObjectURL(blob)
    if (DownloadPackage.lastPackageUrl) {
      URL.revokeObjectURL(DownloadPackage.lastPackageUrl)
    }
    DownloadPackage.lastPackageUrl = url
    const finalFilename = formatFilename(filename)
    a.setAttribute('href', url)
    a.setAttribute('download', finalFilename)
    console.log('[Download file]', finalFilename)
    document.body.appendChild(a)
    a.click()
    a.remove()
  }
  /**
   * 直接下载单个文件
   * @param filename 文件名
   * @param data 文件内容
   */
  static async single(filename: string, data: string | Blob, options: JSZipFileOptions = {}) {
    const pack = new DownloadPackage()
    pack.add(filename, data, options)
    return pack.emit()
  }
}
