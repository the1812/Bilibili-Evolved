/*
MIT License
Copyright (c) 2019 Jerome Wu

Modified 2023 WakelessSloth56
*/

/* eslint-disable @typescript-eslint/naming-convention */

const messageId = (() => {
  let messageID = 0
  return () => messageID++
})()

enum FFMessageType {
  LOAD = 'LOAD',
  EXEC = 'EXEC',
  WRITE_FILE = 'WRITE_FILE',
  READ_FILE = 'READ_FILE',
  DELETE_FILE = 'DELETE_FILE',
  ERROR = 'ERROR',
  PROGRESS = 'PROGRESS',
}

export class FFmpeg {
  #worker: Worker | null = null
  #resolves: Callbacks = {}
  #rejects: Callbacks = {}

  #progressEventCallback: (event: ProgressEvent) => void

  public loaded = false

  #registerHandlers = () => {
    if (this.#worker) {
      this.#worker.onmessage = ({ data: { id, type, data } }: FFMessageEventCallback) => {
        switch (type) {
          case FFMessageType.LOAD:
            this.loaded = true
            this.#resolves[id](data)
            break
          case FFMessageType.EXEC:
          case FFMessageType.WRITE_FILE:
          case FFMessageType.READ_FILE:
          case FFMessageType.DELETE_FILE:
            this.#resolves[id](data)
            break
          case FFMessageType.PROGRESS:
            if (this.#progressEventCallback) {
              this.#progressEventCallback(<ProgressEvent>data)
            }
            break
          case FFMessageType.ERROR:
            this.#rejects[id](data)
            break
          default:
            // https://github.com/the1812/Bilibili-Evolved/pull/4521#discussion_r1402041877
            break
        }
        delete this.#resolves[id]
        delete this.#rejects[id]
      }
    }
  }

  #send = (
    { type, data }: Message,
    trans: Transferable[] = [],
    signal?: AbortSignal,
  ): Promise<CallbackData> => {
    if (!this.#worker) {
      return Promise.reject(new Error('FFmpeg is not loaded'))
    }

    return new Promise((resolve, reject) => {
      const id = messageId()
      this.#worker && this.#worker.postMessage({ id, type, data }, trans)
      this.#resolves[id] = resolve
      this.#rejects[id] = reject

      signal?.addEventListener(
        'abort',
        () => {
          reject(new DOMException(`Message # ${id} was aborted`, 'AbortError'))
        },
        { once: true },
      )
    })
  }

  public load = (config: FFMessageLoadConfig, signal?: AbortSignal) => {
    if (!this.#worker) {
      this.#worker = new Worker(config.workerLoadURL, { type: 'classic' })
      this.#registerHandlers()
    }
    return this.#send(
      {
        type: FFMessageType.LOAD,
        data: config,
      },
      undefined,
      signal,
    ) as Promise<boolean>
  }

  public exec = (args: string[], timeout = -1, signal?: AbortSignal) =>
    this.#send(
      {
        type: FFMessageType.EXEC,
        data: { args, timeout },
      },
      undefined,
      signal,
    ) as unknown as Promise<number>

  public terminate = () => {
    const ids = Object.keys(this.#rejects)
    for (const id of ids) {
      this.#rejects[id](new Error('FFmpeg terminated'))
      delete this.#rejects[id]
      delete this.#resolves[id]
    }

    if (this.#worker) {
      this.#worker.terminate()
      this.#worker = null
      this.loaded = false
    }
  }

  public writeFile = (path: string, data: Uint8Array, signal?: AbortSignal) => {
    const trans: Transferable[] = []
    trans.push(data.buffer)
    return this.#send(
      {
        type: FFMessageType.WRITE_FILE,
        data: { path, data },
      },
      trans,
      signal,
    ) as Promise<boolean>
  }

  public readFile = (path: string, signal?: AbortSignal) =>
    this.#send(
      {
        type: FFMessageType.READ_FILE,
        data: { path, encoding: 'binary' },
      },
      undefined,
      signal,
    ) as Promise<Uint8Array>

  public deleteFile = (path: string, signal?: AbortSignal) =>
    this.#send(
      {
        type: FFMessageType.DELETE_FILE,
        data: { path },
      },
      undefined,
      signal,
    ) as Promise<boolean>

  public onProgress(callback: (event: ProgressEvent) => void): void {
    this.#progressEventCallback = callback
  }
}

// ========================================================================== //

interface FFMessageLoadConfig {
  workerLoadURL: string
  coreURL: string
  wasmURL: string
}

interface FFMessageExecData {
  args: string[]
  timeout?: number
}

interface FFMessageWriteFileData {
  path: string
  data: Uint8Array
}

interface FFMessageReadFileData {
  path: string
  encoding: string
}

interface FFMessageDeleteFileData {
  path: string
}

type FFMessageData =
  | FFMessageLoadConfig
  | FFMessageExecData
  | FFMessageWriteFileData
  | FFMessageReadFileData
  | FFMessageDeleteFileData

interface Message {
  type: string
  data?: FFMessageData
}

interface ProgressEvent {
  progress: number
  time: number
}

type CallbackData = Uint8Array | string | boolean | Error | ProgressEvent | undefined

interface Callbacks {
  [id: number | string]: (data: CallbackData) => void
}

interface FFMessageEventCallback {
  data: {
    id: number
    type: string
    data: CallbackData
  }
}
