import { childList } from './observer'

/**
 * `<head>`载入后运行
 * @param callback 回调函数
 */
export const headLoaded = <T>(callback: () => T) =>
  new Promise<T>(resolve => {
    if (document.head !== null) {
      resolve(callback())
    } else {
      const [observer] = childList(document.documentElement, () => {
        if (document.head !== null) {
          observer.disconnect()
          resolve(callback())
        }
      })
    }
  })

/**
 * `<body>`载入后运行 (`DOMContentLoaded`)
 * @param callback 回调函数
 */
export const contentLoaded = <T>(callback: () => T) =>
  new Promise<T>(resolve => {
    if (document.readyState !== 'loading') {
      resolve(callback())
    } else {
      document.addEventListener('DOMContentLoaded', () => resolve(callback()))
    }
  })

/**
 * 网页`load`事件时运行
 * @param callback 回调函数
 */
export const fullyLoaded = <T>(callback: () => T) =>
  new Promise<T>(resolve => {
    if (document.readyState === 'complete') {
      resolve(callback())
    } else {
      unsafeWindow.addEventListener('load', () => resolve(callback()))
    }
  })
/**
 * 脚本的生命周期事件类型
 */
export enum LifeCycleEventTypes {
  /** 脚本开始运行 */
  Start = 'be:start',
  /** 载入了组件的样式 */
  StyleLoaded = 'be:style-loaded',
  /** 运行了组件的逻辑 */
  ComponentsLoaded = 'be:components-loaded',
  /** 脚本完成运行 */
  End = 'be:end',
}
/**
 * 触发脚本的生命周期事件
 * @param type 事件类型
 */
export const raiseLifeCycleEvent = (type: LifeCycleEventTypes) => {
  unsafeWindow.dispatchEvent(new CustomEvent(type))
}
