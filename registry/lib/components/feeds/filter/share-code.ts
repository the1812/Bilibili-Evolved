export const shareCodeVersion = 1

export interface FeedsFilterShareData {
  version: typeof shareCodeVersion
  types: number[]
  specialTypes: number[]
  sideCards: number[]
  patterns: {
    pattern: string
    enabled: boolean
  }[]
}

const isValidShareData = (data: unknown): data is FeedsFilterShareData => {
  const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null
  if (!isRecord(data) || data.version !== shareCodeVersion) {
    return false
  }
  const isNumberArray = (value: unknown): value is number[] =>
    Array.isArray(value) && value.every(item => Number.isInteger(item))
  const { types, specialTypes, sideCards, patterns } = data
  return (
    [types, specialTypes, sideCards].every(isNumberArray) &&
    Array.isArray(patterns) &&
    patterns.every(
      item =>
        isRecord(item) && typeof item.pattern === 'string' && typeof item.enabled === 'boolean',
    )
  )
}

export const encodeShareCode = (data: FeedsFilterShareData) => {
  const bytes = new TextEncoder().encode(JSON.stringify(data))
  let binary = ''
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}

export const decodeShareCode = (code: string): FeedsFilterShareData => {
  let data: unknown
  try {
    const binary = atob(code.trim())
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0))
    data = JSON.parse(new TextDecoder().decode(bytes))
    if (!isValidShareData(data)) {
      throw new Error()
    }
  } catch {
    throw new Error('分享码无效')
  }
  return {
    version: shareCodeVersion,
    types: data.types,
    specialTypes: data.specialTypes,
    sideCards: data.sideCards,
    patterns: data.patterns.map(({ pattern, enabled }) => ({ pattern, enabled })),
  }
}
