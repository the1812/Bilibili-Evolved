import { Toast } from '@/core/toast'
import { formatFileSize, formatPercent } from '@/core/utils/formatters'

type OnProgress = (received: number, length: number) => void

export function toastProgress(toast: Toast, message: string): OnProgress {
  return (r, l) => {
    toast.message = `${message}: ${formatFileSize(r)}${
      l > 0 ? ` / ${formatFileSize(l)} @ ${formatPercent(r / l)}` : ''
    }`
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

export async function toBlobUrl(url: string, mimeType: string, onprogress: OnProgress) {
  const buffer = await httpGet(url, onprogress)
  const blob = new Blob([buffer], { type: mimeType })
  return URL.createObjectURL(blob)
}
