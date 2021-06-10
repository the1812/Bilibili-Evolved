/** 升序排序 */
export const ascendingSort = <T>(itemProp: (obj: T) => number) => (
  (a: T, b: T) => itemProp(a) - itemProp(b)
)
export const ascendingStringSort = <T>(itemProp: (obj: T) => string) => (
  (a: T, b: T) => itemProp(a).localeCompare(itemProp(b))
)
/** 降序排序 */
export const descendingSort = <T>(itemProp: (obj: T) => number) => (
  (a: T, b: T) => itemProp(b) - itemProp(a)
)
export const descendingStringSort = <T>(itemProp: (obj: T) => string) => (
  (a: T, b: T) => itemProp(b).localeCompare(itemProp(a))
)
