export interface FeedsFilterShareData {
  version: 1
  types: number[]
  specialTypes: number[]
  sideCards: number[]
  patterns: {
    pattern: string
    enabled: boolean
  }[]
}

export const shareCodeVersion = 1

const encodeText = (text: string) => {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}

const decodeText = (encoded: string) => {
  const binary = atob(encoded)
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

const toBase64Url = (base64: string) =>
  base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

const fromBase64Url = (base64Url: string) => {
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  return base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
}

export const encodeShareCode = (data: FeedsFilterShareData) =>
  toBase64Url(encodeText(JSON.stringify(data)))

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const maxArrayLength = 1000

const isNumberArray = (value: unknown): value is number[] =>
  Array.isArray(value) &&
  value.length <= maxArrayLength &&
  value.every(item => Number.isInteger(item))

const isPatternArray = (value: unknown): value is FeedsFilterShareData['patterns'] =>
  Array.isArray(value) &&
  value.length <= maxArrayLength &&
  value.every(
    item => isRecord(item) && typeof item.pattern === 'string' && typeof item.enabled === 'boolean',
  )

export const decodeShareCode = (code: string): FeedsFilterShareData => {
  let data: unknown
  try {
    const text = decodeText(fromBase64Url(code.trim()))
    data = JSON.parse(text)
  } catch {
    throw new Error('分享码格式无效')
  }
  if (!isRecord(data)) {
    throw new Error('分享码内容无效')
  }
  if (data.version !== shareCodeVersion) {
    throw new Error(`不支持的分享码版本: ${String(data.version)}`)
  }
  if (
    !isNumberArray(data.types) ||
    !isNumberArray(data.specialTypes) ||
    !isNumberArray(data.sideCards) ||
    !isPatternArray(data.patterns)
  ) {
    throw new Error('分享码内容不完整')
  }
  return {
    version: shareCodeVersion,
    types: data.types,
    specialTypes: data.specialTypes,
    sideCards: data.sideCards,
    patterns: data.patterns,
  }
}
