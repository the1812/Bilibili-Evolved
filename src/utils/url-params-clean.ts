const blockParams = [
  'spm_id_from',
  'from_source',
  'from',
  'seid',
]
const clean = () => {
  const urlParams = location.search.substring(1).split('&')
  const filteredParams = urlParams.filter(p => {
    if (blockParams.some(b => p.startsWith(`${b}=`))) {
      return false
    }
    return true
  })
  if (urlParams.length !== filteredParams.length) {
    const filteredParamsString = filteredParams.join('&')
    const newUrl = document.URL.replace(location.search, filteredParamsString ? ('?' + filteredParamsString) : '')
    console.log('[URL params clean]', document.URL, newUrl)
    history.replaceState({}, document.title, newUrl)
  }
}
Observer.videoChange(() => clean())
