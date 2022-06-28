import { meta } from '@/core/meta'

export const initMdiStyle = () => {
  const mdi = document.createElement('link')
  mdi.rel = 'stylesheet'
  mdi.href = meta.compilationInfo.altCdn.library.mdi
  mdi.media = 'none'
  mdi.onload = () => {
    mdi.media = 'all'
  }
  return mdi
}
