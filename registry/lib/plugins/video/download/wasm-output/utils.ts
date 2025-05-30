import { RuntimeLibrary, RuntimeLibraryDefinition } from '@/core/runtime-library'
import { Toast } from '@/core/toast'
import { formatDuration, formatFileSize, formatPercent } from '@/core/utils/formatters'
import { getOrLoad, storeNames } from './database'

type OnProgress = (received: number, total: number, speed: number) => void

function formatProgress(received: number, total: number, speed: number) {
  const fReceived = formatFileSize(received)
  const fTotal = total > 0 ? ` / ${formatFileSize(total)}` : ''
  const percent = total > 0 ? ` @ ${formatPercent(received / total)}` : ''
  let remTime = ''
  let fSpeed = ''
  if (total > received && speed > 0) {
    fSpeed = ` (${formatFileSize(speed)}/s)`
    remTime = ` - ${formatDuration((total - received) / speed)}`
  }

  return `${fReceived}${fTotal}${percent}${fSpeed}${remTime}`
}
export function toastProgress(toast: Toast) {
  const lines = []
  return (line: number, message: string): OnProgress => {
    return (r, l, s) => {
      lines[line] = `${message}: ${formatProgress(r, l, s)}`
      toast.message = lines.join('\n')
    }
  }
}

function parseContentLength(response: Response) {
  // https://github.com/the1812/Bilibili-Evolved/pull/4521#discussion_r1402127375
  return response.headers.get('Content-Encoding')
    ? -1
    : parseInt(response.headers.get('Content-Length'))
}

export async function httpGet(url: string, onprogress: OnProgress) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`)
  }

  const reader = response.body.getReader()

  const length = parseContentLength(response)

  let received = 0
  const chunks = []
  let lastTime = Date.now()
  let lastReceived = 0
  let lastSpeed = 0
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }
    chunks.push(value)
    received += value.length
    const now = Date.now()
    const deltaTime = (now - lastTime) / 1000
    if (deltaTime > 1) {
      const receivedDelta = received - lastReceived
      const speed = receivedDelta / deltaTime
      onprogress(received, length, speed)
      lastTime = now
      lastReceived = received
      lastSpeed = speed
    } else {
      onprogress(received, length, lastReceived > 0 ? lastSpeed : 0)
    }
  }

  const chunksAll = new Uint8Array(received)
  let position = 0
  for (const chunk of chunks) {
    chunksAll.set(chunk, position)
    position += chunk.length
  }

  return chunksAll
}

export async function getContentLength(url: string) {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok ? parseContentLength(response) : -1
  } catch (_) {
    return -1
  }
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
