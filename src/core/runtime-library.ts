import type protobufType from 'protobufjs'
import type JSZipType from 'jszip'
import type SortableJSType from 'sortablejs'
import type StreamSaverType from 'streamsaver'
import { monkey } from './ajax'
import { meta } from './meta'

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
          ;(function runEval() {
            return eval(code)
            // eslint-disable-next-line no-extra-bind
          }).bind(window)()
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
  url: meta.compilationInfo.altCdn.library.protobuf,
  getModule: window => window.protobuf,
})
export const JSZipLibrary = new RuntimeLibrary<typeof JSZipType>({
  url: meta.compilationInfo.altCdn.library.jszip,
  getModule: window => window.JSZip,
})
export const SortableJSLibrary = new RuntimeLibrary<typeof SortableJSType>({
  url: meta.compilationInfo.altCdn.library.sortable,
  getModule: window => window.Sortable,
})
export const StreamSaverLibrary = new RuntimeLibrary<typeof StreamSaverType>({
  url: meta.compilationInfo.altCdn.library.streamsaver,
  getModule: window => window.streamSaver,
})
