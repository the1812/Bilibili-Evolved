const blockParams = [
  'spm_id_from',
  'from_source',
  'from_spmid',
  'from',
  'seid',
  'share_source',
  'share_medium',
  'share_plat',
  'share_tag',
  'bbid',
  'ts',
  'timestamp',
  'unique_k',
  'rt',
  'tdsourcetag',
  'accept_quality',
  'broadcast_type',
  'current_qn',
  'current_quality',
  'playurl_h264',
  'playurl_h265',
  'quality_description',
  'network',
  'network_status',
  'platform_network_status',
  'p2p_type',
  'referfrom',
]
const noNormalizes = [
  /game\.bilibili\.com\/fgo/,
]
const normalizeURL = (url: string) => {
  return url
  // return url.endsWith('/') && (noNormalizes.every(r => !r.test(url))) ? _.trimEnd(url, '/') : url
}
const noClean = [
  'videocard_series',
]
const clean = () => {
  const urlParams = location.search.substring(1).split('&')
  if (urlParams.some(param => noClean.some(it => param.includes(it)))) {
    return
  }
  const filteredParams = urlParams.filter(p => {
    if (blockParams.some(b => p.startsWith(`${b}=`))) {
      return false
    }
    return true
  })
  // if (urlParams.length !== filteredParams.length) {
  const filteredParamsString = filteredParams.join('&')
  const url = normalizeURL(document.URL.replace(location.search, ''))
  const query = filteredParamsString ? ('?' + filteredParamsString) : ''
  const newUrl = url + query
  if (newUrl !== document.URL) {
    console.log('[URL params clean]', document.URL, newUrl)
    history.replaceState({}, document.title, newUrl)
  }
  // }
}
fullyLoaded(() => {
  if (document.contentType === 'text/html') {
    clean()
    Observer.videoChange(() => clean())
  }
})
