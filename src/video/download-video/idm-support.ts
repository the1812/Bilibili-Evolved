type IdmItem = { fragments: { url: string }[] }
export const toIdmFormat = (items: IdmItem[]) => {
  const referer = document.URL.replace(window.location.search, '')
  return items.map(item => {
    return item.fragments.map(f => {
      const url = f.url
      return `<
${url}
referer: ${referer}
User-Agent: ${UserAgent}
>`
    }).join('\n')
  }).join('\n')
}
export default {
  export: {
    toIdmFormat,
  },
}