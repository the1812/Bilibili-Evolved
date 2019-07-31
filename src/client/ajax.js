export class Ajax {
  static send (xhr, body, text = true) {
    return new Promise((resolve, reject) => {
      xhr.addEventListener('load', () => {
        // if (xhr.status.toString().match(/^[45]/)) {
        //   reject(xhr.status)
        // } else {
        resolve(text ? xhr.responseText : xhr.response)
        // }
      })
      xhr.addEventListener('error', () => reject(xhr.status))
      xhr.send(body)
    })
  }
  static getBlob (url) {
    const xhr = new XMLHttpRequest()
    xhr.responseType = 'blob'
    xhr.open('GET', url)
    return this.send(xhr, undefined, false)
  }
  static getBlobWithCredentials (url) {
    const xhr = new XMLHttpRequest()
    xhr.responseType = 'blob'
    xhr.open('GET', url)
    xhr.withCredentials = true
    return this.send(xhr, undefined, false)
  }
  static async getJson (url) {
    return JSON.parse(await this.getText(url))
  }
  static async getJsonWithCredentials (url) {
    return JSON.parse(await this.getTextWithCredentials(url))
  }
  static getText (url) {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', url)
    return this.send(xhr)
  }
  static getTextWithCredentials (url) {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', url)
    xhr.withCredentials = true
    return this.send(xhr)
  }
  static postText (url, body) {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    return this.send(xhr, body)
  }
  static postTextWithCredentials (url, body) {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    xhr.withCredentials = true
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    return this.send(xhr, body)
  }
  static postJson (url, json) {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    xhr.setRequestHeader('Content-Type', 'application/json')
    return this.send(xhr, JSON.stringify(json), false)
  }
  static postJsonWithCredentials (url, json) {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    xhr.withCredentials = true
    xhr.setRequestHeader('Content-Type', 'application/json')
    return this.send(xhr, JSON.stringify(json), false)
  }
  static getHandlers (name) {
    name = name.toLowerCase()
    let handlers = Ajax[name]
    if (handlers === undefined) {
      handlers = Ajax[name] = []
    }
    return handlers
  }
  static addEventListener (type, handler) {
    const handlers = Ajax.getHandlers(type)
    handlers.push(handler)
  }
  static removeEventListener (type, handler) {
    const handlers = Ajax.getHandlers(type)
    handlers.splice(handlers.indexOf(handler), 1)
  }
}
// https://github.com/the1812/Bilibili-Evolved/issues/84
export function setupAjaxHook () {
  const original = {
    open: XMLHttpRequest.prototype.open,
    send: XMLHttpRequest.prototype.send
  }
  const fireHandlers = (name, thisArg, ...args) => Ajax.getHandlers(name).forEach(it => it.call(thisArg, ...args))
  const hook = (name, thisArgs, ...args) => {
    fireHandlers('before' + name, thisArgs, ...args)
    const returnValue = original[name].call(thisArgs, ...args)
    fireHandlers('after' + name, thisArgs, ...args)
    return returnValue
  }
  const hookOnEvent = (name, thisArg) => {
    if (thisArg[name]) {
      const originalHandler = thisArg[name]
      thisArg[name] = (...args) => {
        fireHandlers('before' + name, thisArg, ...args)
        originalHandler.apply(thisArg, args)
        fireHandlers('after' + name, thisArg, ...args)
      }
    } else {
      thisArg[name] = (...args) => {
        fireHandlers('before' + name, thisArg, ...args)
        fireHandlers('after' + name, thisArg, ...args)
      }
    }
  }
  XMLHttpRequest.prototype.open = function (...args) { return hook('open', this, ...args) }
  XMLHttpRequest.prototype.send = function (...args) {
    hookOnEvent('onreadystatechange', this)
    hookOnEvent('onload', this)
    return hook('send', this, ...args)
  }
}
