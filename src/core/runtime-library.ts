import type protobufType from 'protobufjs'
import type JSZipType from 'jszip'
import { monkey } from './ajax'

export interface RuntimeLibraryConfig<LibraryType> {
  url: string
  getModule: (window: Window) => LibraryType
}
export class RuntimeLibrary<LibraryType> implements PromiseLike<LibraryType> {
  private modulePromise: Promise<LibraryType>

  constructor(public config: RuntimeLibraryConfig<LibraryType>) {}

  async then<Resolve = LibraryType, Reject = never>(
    resolve?: (value: LibraryType) => Resolve | PromiseLike<Resolve>,
    reject?: (reason: any) => Reject | PromiseLike<Reject>,
  ) {
    try {
      const { url, getModule } = this.config
      if (!this.modulePromise) {
        this.modulePromise = (async () => {
          console.log(`[Runtime Library] Start download from ${url}`)
          const code: string = await monkey({ url })
          console.log(`[Runtime Library] Downloaded from ${url} , length = ${code.length}`)
          eval(code)
          return getModule(window)
        })()
      }
      const library = await this.modulePromise
      return resolve(library)
    } catch (error) {
      reject(error)
      throw error
    }
  }
}
export const protobufLibrary = new RuntimeLibrary<typeof protobufType>({
  url: 'https://cdn.jsdelivr.net/npm/protobufjs@6.10.1/dist/light/protobuf.min.js',
  getModule: window => window.protobuf,
})
export const JSZipLibrary = new RuntimeLibrary<typeof JSZipType>({
  url: 'https://cdn.jsdelivr.net/npm/jszip@3.7.1/dist/jszip.min.js',
  getModule: window => window.JSZip,
})
