/* ⚠ Ajax Hook API 已废弃, 请勿使用 */

import { PluginMetadata } from '../plugin'

// https://github.com/the1812/Bilibili-Evolved/issues/84
let ajaxHooked = false
const handlerMap: Map<string, ((...args: any[]) => void)[]> = new Map()

/** @deprecated ⚠ Ajax Hook API 已废弃, 请勿使用 */
export const getHandlers = (name: string) => {
  const lowercase = name.toLowerCase()
  let handlers = handlerMap.get(lowercase)
  if (handlers === undefined) {
    handlers = []
    handlerMap.set(lowercase, handlers)
  }
  return handlers
}
const setupAjaxHook = () => {
  if (ajaxHooked) {
    return
  }
  ajaxHooked = true
  const original = {
    open: XMLHttpRequest.prototype.open,
    send: XMLHttpRequest.prototype.send,
  }
  const fireHandlers = (name: string, thisArg: any, ...args: any[]) =>
    getHandlers(name).forEach(it => it.call(thisArg, ...args))
  const hook = (name: string, thisArgs: any, ...args: any[]) => {
    fireHandlers(`before${name}`, thisArgs, ...args)
    const returnValue = original[name].call(thisArgs, ...args)
    fireHandlers(`after${name}`, thisArgs, ...args)
    return returnValue
  }
  const hookOnEvent = (name: string, thisArg: any) => {
    if (thisArg[name]) {
      const originalHandler = thisArg[name]
      thisArg[name] = (...args: any[]) => {
        fireHandlers(`before${name}`, thisArg, ...args)
        originalHandler.apply(thisArg, args)
        fireHandlers(`after${name}`, thisArg, ...args)
      }
    } else {
      thisArg[name] = (...args: any[]) => {
        fireHandlers(`before${name}`, thisArg, ...args)
        fireHandlers(`after${name}`, thisArg, ...args)
      }
    }
  }
  XMLHttpRequest.prototype.open = function openHook(...args: any[]) {
    return hook('open', this, ...args)
  }
  XMLHttpRequest.prototype.send = function sendHook(...args) {
    hookOnEvent('onreadystatechange', this)
    hookOnEvent('onload', this)
    return hook('send', this, ...args)
  }
}

export const plugin: PluginMetadata = {
  name: 'ajaxHook',
  displayName: 'Ajax Hook API',
  setup: setupAjaxHook,
}
