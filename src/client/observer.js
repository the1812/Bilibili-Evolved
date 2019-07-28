let cidHooked = false
const videoChangeCallbacks = []
export class Observer {
  constructor (element, callback) {
    this.element = element
    this.callback = callback
    this.observer = null
    this.options = undefined
  }
  start () {
    if (this.element) {
      this.observer = new MutationObserver(this.callback)
      this.observer.observe(this.element, this.options)
    }
    return this
  }
  stop () {
    this.observer && this.observer.disconnect()
    return this
  }
  static observe (selector, callback, options) {
    callback([])
    let elements = selector
    if (typeof selector === 'string') {
      elements = [...document.querySelectorAll(selector)]
    } else if (!Array.isArray(selector)) {
      elements = [selector]
    }
    return elements.map(
      it => {
        const observer = new Observer(it, callback)
        observer.options = options
        return observer.start()
      })
  }
  static childList (selector, callback) {
    return Observer.observe(selector, callback, {
      childList: true,
      subtree: false,
      attributes: false
    })
  }
  static childListSubtree (selector, callback) {
    return Observer.observe(selector, callback, {
      childList: true,
      subtree: true,
      attributes: false
    })
  }
  static attributes (selector, callback) {
    return Observer.observe(selector, callback, {
      childList: false,
      subtree: false,
      attributes: true
    })
  }
  static attributesSubtree (selector, callback) {
    return Observer.observe(selector, callback, {
      childList: false,
      subtree: true,
      attributes: true
    })
  }
  static all (selector, callback) {
    return Observer.observe(selector, callback, {
      childList: true,
      subtree: true,
      attributes: true
    })
  }
  static async videoChange (callback) {
    const cid = await SpinQuery.select(() => unsafeWindow.cid)
    if (cid === null) {
      return
    }
    if (!cidHooked) {
      let hookedCid = cid
      Object.defineProperty(unsafeWindow, 'cid', {
        get () {
          return hookedCid
        },
        set (newId) {
          hookedCid = newId
          if (!Array.isArray(newId)) {
            videoChangeCallbacks.forEach(it => it())
          }
        }
      })
      cidHooked = true
    }
    // callback();
    const videoContainer = await SpinQuery.select('#bofqi video')
    if (videoContainer) {
      Observer.childList(videoContainer, callback)
    } else {
      callback()
    }
    videoChangeCallbacks.push(callback)
  }
}
