let cidHooked = false
const videoChangeCallbacks = []
export class Observer {
  constructor (elements, callback) {
    this.elements = elements || []
    this.callback = callback
    this.observer = null
    this.options = undefined
  }
  start () {
    this.elements.forEach(element => {
      this.observer = new MutationObserver(this.callback)
      this.observer.observe(element, this.options)
    })
    return this
  }
  add (element) {
    this.elements.push(element)
    this.observer.observe(element, this.options)
    return this
  }
  stop () {
    this.observer && this.observer.disconnect()
    return this
  }
  // 向后兼容的接口, 实际并没有什么遍历
  forEach (callback) {
    callback(this)
  }
  static observe (selector, callback, options) {
    callback([])
    let elements = selector
    if (typeof selector === 'string') {
      elements = [...document.querySelectorAll(selector)]
    } else if (!Array.isArray(selector)) {
      elements = [selector]
    }
    const observer = new Observer(elements, callback)
    observer.options = options
    return observer.start()
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
