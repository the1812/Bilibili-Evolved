import mdiStyle from './mdi.css'

export const initMdiStyle = () => {
  // const mdi = document.createElement('link')
  // mdi.rel = 'stylesheet'
  // mdi.href = meta.compilationInfo.altCdn.library.mdi
  // mdi.media = 'none'

  // const webFont = document.createElement('link')
  // webFont.rel = 'preload'
  // webFont.href = meta.compilationInfo.altCdn.library.mdi.replace(/\.css$/, '.woff2')
  // webFont.as = 'font'
  // webFont.type = 'font/woff2'
  // webFont.crossOrigin = 'anonymous'

  // const webFontPromise = new Promise<void>(resolve => {
  //   webFont.onload = () => resolve()
  // })
  // const cssPromise = new Promise<void>(resolve => {
  //   mdi.onload = () => resolve()
  // })
  // Promise.allSettled([cssPromise, webFontPromise]).then(() => {
  //   mdi.media = 'all'
  // })

  // return [mdi, webFont]

  const mdi = document.createElement('style')
  mdi.id = 'be-mdi'
  mdi.innerHTML = mdiStyle

  return mdi
}
