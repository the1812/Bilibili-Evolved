import { Toast } from '@/core/toast'
import { formatFileSize, formatPercent } from '@/core/utils/formatters'
import { getOrLoad, storeNames } from './database'
import { RuntimeLibraryDefinition, RuntimeLibrary } from '@/core/runtime-library'

type OnProgress = (received: number, total: number) => void

function formatProgress(received: number, total: number) {
  return `${formatFileSize(received)}${
    total > 0 ? ` / ${formatFileSize(total)} @ ${formatPercent(received / total)}` : ''
  }`
}

export function toastProgress(toast: Toast) {
  const lines = []
  return (line: number, message: string): OnProgress => {
    return (r, l) => {
      lines[line] = `${message}: ${formatProgress(r, l)}`
      toast.message = lines.join('\n')
    }
  }
}

export async function httpGet(url: string, onprogress: OnProgress) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`)
  }

  const reader = response.body.getReader()

  // https://github.com/the1812/Bilibili-Evolved/pull/4521#discussion_r1402127375
  const length = response.headers.get('Content-Encoding')
    ? -1
    : parseInt(response.headers.get('Content-Length'))

  let received = 0
  const chunks = []
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }
    chunks.push(value)
    received += value.length
    onprogress(received, length)
  }

  const chunksAll = new Uint8Array(received)
  let position = 0
  for (const chunk of chunks) {
    chunksAll.set(chunk, position)
    position += chunk.length
  }

  return chunksAll
}

export async function getCacheOrFetch(
  key: string,
  library: RuntimeLibraryDefinition,
  loading: OnProgress,
) {
  return getOrLoad(storeNames.cache, key, async () => {
    const content = await httpGet(library.url, loading)
    const sha256 = await RuntimeLibrary.sha256(content)
    if (sha256 !== library.sha256) {
      throw new Error(
        `Check integrity failed from ${library.url}, expected = ${library.sha256}, actual = ${sha256}`,
      )
    }
    return content
  })
}

export function toBlobUrl(buffer: Uint8Array, mimeType: string) {
  const blob = new Blob([buffer], { type: mimeType })
  return URL.createObjectURL(blob)
}
