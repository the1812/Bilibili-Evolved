import { Property, ValueChangeListener } from './types'

/** 标识经由 `createProxy` 控制的对象 */
export const isProxy = Symbol('isProxy')

/**
 * 为目标对象创建深层 Proxy
 * @param targetObj 目标对象
 * @param valueChangeListener 对象自身属性变化时的回调函数
 */
export const createProxy = (targetObj: any, valueChangeListener?: ValueChangeListener) => {
  const applyProxy = (obj: any, rootProp?: Property, propPath: Property[] = []) => {
    for (const [key, value] of Object.entries(obj)) {
      const shouldApplyProxy = typeof value === 'object' && !(value instanceof RegExp)
      if (shouldApplyProxy) {
        obj[key] = applyProxy(value, rootProp || key, [...propPath, key])
      }
    }
    const proxy = new Proxy(obj, {
      get(o, prop) {
        if (prop === isProxy) {
          return true
        }
        return o[prop]
      },
      set(o, prop, value) {
        const oldValue = o[prop]
        const isImplicitProp =
          !Object.prototype.hasOwnProperty.call(o, prop) && oldValue !== undefined
        if (unsafeWindow.proxyDebug) {
          console.log({ isImplicitProp, prop, rootProp, propPath, value, oldValue })
        }
        /**
         * 是否对 value 启用深层 Proxy
         * - 是 Object (或 Array)
         * - 不能是 RegExp
         * - 不能是已经启用过的
         * - 不能是上游原型链里的
         */
        const deep =
          typeof value === 'object' &&
          !(value instanceof RegExp) &&
          !(value[isProxy] === true) &&
          !isImplicitProp
        if (deep) {
          value = applyProxy(value, rootProp || prop, [...propPath, prop])
        }
        o[prop] = value
        if (!isImplicitProp) {
          valueChangeListener?.(value, oldValue, rootProp || prop, [...propPath, prop])
        }
        return true
      },
      deleteProperty(o, prop) {
        const oldValue = o[prop]
        delete o[prop]
        valueChangeListener?.(undefined, oldValue, rootProp || prop, [...propPath, prop])
        return true
      },
    })
    return proxy
  }
  return applyProxy(targetObj)
}
