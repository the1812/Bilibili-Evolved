import type protobufType from 'protobufjs'
import type JSZipType from 'jszip'
import type SortableJSType from 'sortablejs'
import type StreamSaverType from 'streamsaver'
import { monkey } from './ajax'
import { meta } from './meta'

export type RuntimeLibraryDefinition = { url: string; sha256: string }
export interface RuntimeLibraryConfig<LibraryType> {
  library: RuntimeLibraryDefinition
  getModule: (window: Window) => LibraryType
}

export class RuntimeLibrary<LibraryType> implements PromiseLike<LibraryType> {
  private modulePromise: Promise<LibraryType>

  constructor(public config: RuntimeLibraryConfig<LibraryType>) {}

  static async sha256(content: string | BufferSource) {
    const hashBuffer = await window.crypto.subtle.digest(
      'SHA-256',
      typeof content === 'string' ? new TextEncoder().encode(content) : content,
    )
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return hashHex
  }

  private async checkIntegrity(content: string | BufferSource) {
    const sha256 = await RuntimeLibrary.sha256(content)
    if (sha256 !== this.config.library.sha256) {
      throw new Error(
        `[RuntimeLibrary] Check integrity failed from ${this.config.library.url}, expected = ${this.config.library.sha256}, actual = ${sha256}`,
      )
    }
    console.log(
      `[Runtime Library] Checked integrity from ${this.config.library.url}, hash = ${sha256}`,
    )
  }

  async then<Resolve = LibraryType, Reject = never>(
    resolve?: (value: LibraryType) => Resolve | PromiseLike<Resolve>,
    reject?: (reason: any) => Reject | PromiseLike<Reject>,
  ) {
    try {
      const {
        library: { url },
        getModule,
      } = this.config
      if (!this.modulePromise) {
        this.modulePromise = (async () => {
          console.log(`[Runtime Library] Start download from ${url}`)
          const code: string = await monkey({ url })
          console.log(`[Runtime Library] Downloaded from ${url}, length = ${code.length}`)
          await this.checkIntegrity(code)
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
  library: meta.compilationInfo.altCdn.library.protobuf,
  getModule: window => window.protobuf,
})
export const JSZipLibrary = new RuntimeLibrary<typeof JSZipType>({
  library: meta.compilationInfo.altCdn.library.jszip,
  getModule: window => window.JSZip,
})
export const SortableJSLibrary = new RuntimeLibrary<typeof SortableJSType>({
  library: meta.compilationInfo.altCdn.library.sortable,
  getModule: window => window.Sortable,
})
export const StreamSaverLibrary = new RuntimeLibrary<typeof StreamSaverType>({
  library: meta.compilationInfo.altCdn.library.streamsaver,
  getModule: window => window.streamSaver,
})
