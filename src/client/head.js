export const headLoaded = (callback = () => {}) => {
  return new Promise(resolve => {
    if (document.head !== null) {
      resolve(callback())
    } else {
      const observer = new MutationObserver(() => {
        if (document.head !== null) {
          observer.disconnect()
          resolve(callback())
        }
      })
      observer.observe(document.documentElement, { childList: true, subtree: false })
    }
  })
}