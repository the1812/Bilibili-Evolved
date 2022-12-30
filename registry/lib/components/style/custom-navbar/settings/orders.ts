import { CustomNavbarItem } from '../custom-navbar-item'

const regenerateOrder = (items: CustomNavbarItem[]) => {
  items.forEach((item, index) => {
    if (item.order === index) {
      return
    }
    item.order = index
  })
  const orderMap = Object.fromEntries(items.map(it => [it.name, it.order]))
  CustomNavbarItem.navbarOptions.order = orderMap
}
export const checkSequentialOrder = (items: CustomNavbarItem[]) => {
  const isSequentialOrder = items.every((item, index) => item.order === index)
  if (!isSequentialOrder) {
    regenerateOrder(items)
  }
}
export const sortItems = (items: CustomNavbarItem[], orderMap: Record<string, number>) => {
  const sortedItems = lodash.sortBy(items, it => orderMap[it.name])
  regenerateOrder(sortedItems)
  return sortedItems
}
