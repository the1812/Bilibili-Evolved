export enum DownloadVideoUrlType {
  Mirror = 'mirror',
  UPOS = 'upos',
  BCache = 'bcache',
  MCDN = 'mcdn',
  Other = 'other',
}

export const MirrorCdnHostPattern =
  // spell-checker: disable-next-line
  /^upos-(sz|hz|bstar)-mirror([0-9,a-z]+)\.(bilivideo\.com|akamaized\.net)$/

/** @see https://github.com/the1812/Bilibili-Evolved/issues/3234#issuecomment-1504764774 */
export const parseVideoUrlType = (url: string): DownloadVideoUrlType => {
  try {
    const { hostname, searchParams } = new URL(url)
    if (MirrorCdnHostPattern.test(hostname)) {
      return DownloadVideoUrlType.Mirror
    }
    const os = searchParams.get('os')?.toLowerCase()
    if (os === 'upos') {
      return DownloadVideoUrlType.UPOS
    }
    if (os === 'bcache') {
      return DownloadVideoUrlType.BCache
    }
    if (os === 'mcdn') {
      return DownloadVideoUrlType.MCDN
    }
    return DownloadVideoUrlType.Other
  } catch {
    return DownloadVideoUrlType.Other
  }
}

export const sortVideoUrlByType = (urls: string[]) => {
  const sortKeys = {
    [DownloadVideoUrlType.Mirror]: 0,
    [DownloadVideoUrlType.UPOS]: 1,
    [DownloadVideoUrlType.BCache]: 2,
    [DownloadVideoUrlType.MCDN]: 3,
    [DownloadVideoUrlType.Other]: 4,
  }
  return [...urls].sort((a, b) => {
    const typeA = parseVideoUrlType(a)
    const typeB = parseVideoUrlType(b)
    return sortKeys[typeA] - sortKeys[typeB]
  })
}
