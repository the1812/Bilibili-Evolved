const blockParams = [
  'spm_id_from',
  'from_source',
  'from',
  'seid',
]
const urlParams = location.search.substring(1).split('&')
const filteredParams = urlParams.filter(p => {
  if (blockParams.some(b => p.startsWith(`${b}=`))) {
    return false
  }
  return true
}).join('&')
history.pushState({}, document.title, document.URL.replace(location.search, filteredParams ? ('?' + filteredParams) : ''))
