import { settingsInternalState } from './internal-state'
import { Property, ValueChangeListener } from './types'

export const registeredListeners = new Map<string, ValueChangeListener[]>()
export const settingsChangedHandler = (
  value: any,
  oldValue: any,
  prop: Property,
  propPath: Property[] = [],
) => {
  if (settingsInternalState.settingsLoaded) {
    GM_setValue(prop.toString(), settingsInternalState.internalSettings[prop.toString()])
    const path = propPath.join('.')
    // 如果父级是普通对象或数组也会通知, 但没有旧值
    if (propPath.length > 1) {
      const parentPath = propPath.slice(0, propPath.length - 1).join('.')
      const parent = lodash.get(settingsInternalState.internalSettings, parentPath)
      const notifyParent = Array.isArray(parent) || lodash.isPlainObject(parent)
      if (notifyParent) {
        const handlers = registeredListeners.get(parentPath)
        handlers?.forEach(h => h(parent, null, prop, propPath))
      }
    }
    const handlers = registeredListeners.get(path)
    handlers?.forEach(h => h(value, oldValue, prop, propPath))
  }
}
