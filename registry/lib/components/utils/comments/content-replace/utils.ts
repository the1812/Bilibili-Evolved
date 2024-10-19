export const createEmotionImage = (src: string, alt: string) => {
  const element = document.createElement('img')
  element.src = src
  element.alt = alt
  element.loading = 'lazy'
  element.style.width = '50px'
  element.style.height = '50px'
  return element
}
