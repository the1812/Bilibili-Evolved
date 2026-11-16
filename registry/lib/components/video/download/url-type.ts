export enum DownloadVideoUrlType {
  Mirror = 'mirror',
  MirrorAkamaized = 'mirror_akamaized',
  UPOS = 'upos',
  BCache = 'bcache',
  MCDN = 'mcdn',
  Other = 'other',
}

export const MirrorCdnHostPattern =
  // spell-checker: disable-next-line
  /^upos-([0-9a-z]+?)-mirror([0-9a-z]+)\.(bilivideo\.com|akamaized\.net)$/

/** @see https://github.com/the1812/Bilibili-Evolved/issues/3234#issuecomment-1504764774 */
export const parseVideoUrlType = (
  url: string,
  classifyAkamaizedCdn = true,
): DownloadVideoUrlType => {
  try {
    const { hostname, port, searchParams } = new URL(url)
    if (MirrorCdnHostPattern.test(hostname)) {
      if (classifyAkamaizedCdn && hostname.endsWith('akamaized.net')) {
        return DownloadVideoUrlType.MirrorAkamaized
      }
      return DownloadVideoUrlType.Mirror
    }
    const os = searchParams.get('os')?.toLowerCase()
    if (os === 'upos' || hostname.includes('upos')) {
      return DownloadVideoUrlType.UPOS
    }
    if (os === 'bcache') {
      return DownloadVideoUrlType.BCache
    }
    const hasNonHTTPPort = port !== '' && port !== '80' && port !== '443'
    if (os === 'mcdn' || hostname.includes('mcdn') || hasNonHTTPPort) {
      return DownloadVideoUrlType.MCDN
    }
    return DownloadVideoUrlType.Other
  } catch {
    return DownloadVideoUrlType.Other
  }
}

export const sortVideoUrlByType = (urls: string[], classifyAkamaizedCdn = true) => {
  const sortKeys = {
    [DownloadVideoUrlType.Mirror]: 0,
    [DownloadVideoUrlType.UPOS]: 1,
    [DownloadVideoUrlType.BCache]: 2,
    [DownloadVideoUrlType.MirrorAkamaized]: classifyAkamaizedCdn ? 0 : 3,
    [DownloadVideoUrlType.MCDN]: 4,
    [DownloadVideoUrlType.Other]: 5,
  }
  return [...urls]
    .map(x => ({ url: x, type: parseVideoUrlType(x, classifyAkamaizedCdn) }))
    .sort((a, b) => {
      return sortKeys[a.type] - sortKeys[b.type]
    })
}
