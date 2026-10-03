export type NativeFetch = typeof fetch

type WbiKeys = {
  imgKey: string
  subKey: string
}

const navApi = 'https://api.bilibili.com/x/web-interface/nav'
const mixinKeyEncTab = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49, 33, 9, 42,
  19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51,
  30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11, 36, 20, 34, 44, 52,
]

let wbiKeysPromise: Promise<WbiKeys> | null = null

const md5 = (input: string) => {
  const bytes = new TextEncoder().encode(input)
  const padLength = (56 - ((bytes.length + 1) % 64) + 64) % 64
  const data = new Uint8Array(bytes.length + 1 + padLength + 8)
  data.set(bytes)
  data[bytes.length] = 0x80

  const bitLengthLow = (bytes.length * 8) >>> 0
  const bitLengthHigh = Math.floor(bytes.length / 0x20000000) >>> 0
  const end = data.length - 8
  data[end] = bitLengthLow & 0xff
  data[end + 1] = (bitLengthLow >>> 8) & 0xff
  data[end + 2] = (bitLengthLow >>> 16) & 0xff
  data[end + 3] = (bitLengthLow >>> 24) & 0xff
  data[end + 4] = bitLengthHigh & 0xff
  data[end + 5] = (bitLengthHigh >>> 8) & 0xff
  data[end + 6] = (bitLengthHigh >>> 16) & 0xff
  data[end + 7] = (bitLengthHigh >>> 24) & 0xff

  const shifts = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20,
    5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ]
  const constants = Array.from(
    { length: 64 },
    (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000) >>> 0,
  )
  const rotateLeft = (value: number, amount: number) =>
    ((value << amount) | (value >>> (32 - amount))) >>> 0

  let a0 = 0x67452301
  let b0 = 0xefcdab89
  let c0 = 0x98badcfe
  let d0 = 0x10325476

  for (let offset = 0; offset < data.length; offset += 64) {
    const words = new Uint32Array(16)
    for (let i = 0; i < 16; i++) {
      const p = offset + i * 4
      words[i] =
        (data[p] | (data[p + 1] << 8) | (data[p + 2] << 16) | (data[p + 3] << 24)) >>> 0
    }

    let a = a0
    let b = b0
    let c = c0
    let d = d0
    for (let i = 0; i < 64; i++) {
      let f: number
      let g: number
      if (i < 16) {
        f = (b & c) | (~b & d)
        g = i
      } else if (i < 32) {
        f = (d & b) | (~d & c)
        g = (5 * i + 1) % 16
      } else if (i < 48) {
        f = b ^ c ^ d
        g = (3 * i + 5) % 16
      } else {
        f = c ^ (b | ~d)
        g = (7 * i) % 16
      }
      const sum = (a + (f >>> 0) + constants[i] + words[g]) >>> 0
      const next = (b + rotateLeft(sum, shifts[i])) >>> 0
      a = d
      d = c
      c = b
      b = next
    }

    a0 = (a0 + a) >>> 0
    b0 = (b0 + b) >>> 0
    c0 = (c0 + c) >>> 0
    d0 = (d0 + d) >>> 0
  }

  const hexByte = (n: number) => n.toString(16).padStart(2, '0')
  const wordHex = (word: number) =>
    hexByte(word & 0xff) +
    hexByte((word >>> 8) & 0xff) +
    hexByte((word >>> 16) & 0xff) +
    hexByte((word >>> 24) & 0xff)
  return wordHex(a0) + wordHex(b0) + wordHex(c0) + wordHex(d0)
}

const extractWbiKey = (url: string) => {
  const parsed = new URL(url)
  const file = parsed.pathname.split('/').pop() ?? ''
  const dot = file.lastIndexOf('.')
  return dot === -1 ? file : file.slice(0, dot)
}

const getWbiKeys = async (nativeFetch: NativeFetch) => {
  if (!wbiKeysPromise) {
    wbiKeysPromise = (async () => {
      const response = await nativeFetch(navApi, { credentials: 'include' })
      const json = await response.json()
      const wbi = json?.data?.wbi_img
      if (!wbi?.img_url || !wbi?.sub_url) {
        throw new Error('无法获取 WBI 签名密钥')
      }
      return {
        imgKey: extractWbiKey(wbi.img_url),
        subKey: extractWbiKey(wbi.sub_url),
      }
    })().catch(error => {
      wbiKeysPromise = null
      throw error
    })
  }
  return wbiKeysPromise
}

export const resetWbiKeys = () => {
  wbiKeysPromise = null
}

export const warmupWbiKeys = async (nativeFetch: NativeFetch) => {
  await getWbiKeys(nativeFetch)
}

export const createSignedUrl = async (
  nativeFetch: NativeFetch,
  baseUrl: string,
  baseParams: Record<string, string>,
  overrides: Record<string, string>,
) => {
  const { imgKey, subKey } = await getWbiKeys(nativeFetch)
  const rawKey = imgKey + subKey
  const mixinKey = mixinKeyEncTab
    .map(index => rawKey[index])
    .join('')
    .slice(0, 32)

  const params: Record<string, string> = {
    ...baseParams,
    ...overrides,
    wts: Math.floor(Date.now() / 1000).toString(),
  }
  delete params.w_rid

  const query = Object.keys(params)
    .sort()
    .map(key => {
      const value = String(params[key]).replace(/[!'()*]/g, '')
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    })
    .join('&')

  return `${baseUrl}?${query}&w_rid=${md5(query + mixinKey)}`
}
