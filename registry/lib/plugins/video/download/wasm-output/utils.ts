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

export async function httpget(url: string, onprogress: OnProgress) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`)
  }

  const reader = response.body.getReader()
  const length = parseInt(response.headers.get('Content-Length') || '0')

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
  const buffer = await httpget(url, onprogress)
  const blob = new Blob([buffer], { type: mimeType })
  return URL.createObjectURL(blob)
}
