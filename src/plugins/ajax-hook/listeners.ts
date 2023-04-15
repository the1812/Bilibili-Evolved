/* ⚠ Ajax Hook API 已废弃, 请勿使用 */

import { getHandlers } from '.'

type AjaxListenerType =
  | 'beforeOnReadyStateChange'
  | 'afterOnReadyStateChange'
  | 'beforeOnLoad'
  | 'afterOnLoad'
  | 'beforeOpen'
  | 'afterOpen'
  | 'beforeSend'
  | 'afterSend'

/**
 * 添加Ajax监听器
 * @deprecated ⚠ Ajax Hook API 已废弃, 请勿使用
 * @param type 事件类型
 * @param listener 监听器函数
 */
export const addAjaxListener = (type: AjaxListenerType, listener: (...args: any[]) => void) => {
  getHandlers(type).push(listener)
}
/**
 * 移除Ajax监听器
 * @deprecated ⚠ Ajax Hook API 已废弃, 请勿使用
 * @param type 事件类型
 * @param listener 监听器函数
 */
export const removeAjaxListener = (type: AjaxListenerType, listener: (...args: any[]) => void) => {
  const handlers = getHandlers(type)
  const index = handlers.indexOf(listener)
  if (index !== -1) {
    handlers.splice(index, 1)
  }
}
