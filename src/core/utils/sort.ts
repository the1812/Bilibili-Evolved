const selfSorter = (it: any) => it
/** 升序排序 */
export const ascendingSort =
  <T>(itemProp: (obj: T) => number = selfSorter) =>
  (a: T, b: T) =>
    itemProp(a) - itemProp(b)
/** 字符串升序排序 */
export const ascendingStringSort =
  <T>(itemProp: (obj: T) => string = selfSorter) =>
  (a: T, b: T) =>
    itemProp(a).localeCompare(itemProp(b))
/** 字符串大数字升序排序 */
export const ascendingBigIntSort =
  <T>(itemProp: (obj: T) => string = selfSorter) =>
  (a: T, b: T) => {
    const numberA = BigInt(itemProp(a))
    const numberB = BigInt(itemProp(b))
    if (numberA === numberB) {
      return 0
    }
    return numberA > numberB ? 1 : -1
  }
/** 降序排序 */
export const descendingSort =
  <T>(itemProp: (obj: T) => number = selfSorter) =>
  (a: T, b: T) =>
    itemProp(b) - itemProp(a)
/** 字符串降序排序 */
export const descendingStringSort =
  <T>(itemProp: (obj: T) => string = selfSorter) =>
  (a: T, b: T) =>
    itemProp(b).localeCompare(itemProp(a))
/** 字符串大数字降序排序 */
export const descendingBigIntSort =
  <T>(itemProp: (obj: T) => string = selfSorter) =>
  (a: T, b: T) =>
    -ascendingBigIntSort(itemProp)(a, b)
