export const initMdiStyle = () => {
  const mdi = document.createElement('link')
  mdi.rel = 'stylesheet'
  mdi.href = 'https://cdn.jsdelivr.net/gh/Templarian/MaterialDesign-Webfont@5.3.45/css/materialdesignicons.min.css'
  mdi.media = 'none'
  mdi.onload = () => {
    mdi.media = 'all'
  }
  return mdi
}
