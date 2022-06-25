/** 深层合并 GM_getValue 和当前值 */
export const mergeValue = (gmValue: any, currentValue: any) => {
  if (typeof gmValue === 'object') {
    return lodash.defaultsDeep(gmValue, currentValue)
  }
  return gmValue
}
/** 根据 obj 上的 key 读取保存的设置 */
export const readSettings = (obj: any) => {
  for (const [key, value] of Object.entries(obj)) {
    const gmValue = GM_getValue(key, value)
    obj[key] = mergeValue(gmValue, value)
  }
  return obj
}
