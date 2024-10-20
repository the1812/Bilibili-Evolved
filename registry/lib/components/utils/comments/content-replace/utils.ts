export const createEmoticonImage = (src: string, alt: string) => {
  const element = document.createElement('img')
  element.src = src
  element.alt = alt
  element.loading = 'lazy'
  element.style.width = '50px'
  element.style.height = '50px'
  return element
}

export const isUrl = (text: string) => {
  try {
    const url = new URL(text)
    return Boolean(url)
  } catch (error) {
    return false
  }
}
