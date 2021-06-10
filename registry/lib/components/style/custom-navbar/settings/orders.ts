import { ascendingSort } from '@/core/utils/sort'
import { CustomNavbarItem } from '../custom-navbar-item'

const regenerateOrder = (items: CustomNavbarItem[]) => {
  items.forEach((item, index) => {
    if (item.order === index) {
      return
    }
    item.order = index
    CustomNavbarItem.navbarOptions.order[item.name] = item.order
  })
}
export const checkSequentialOrder = (items: CustomNavbarItem[]) => {
  const isSequentialOrder = items.every((item, index) => item.order === index)
  if (!isSequentialOrder) {
    regenerateOrder(items)
  }
}
export const sortItems = (items: CustomNavbarItem[], orderMap: Record<string, number>) => {
  items.sort(ascendingSort(it => orderMap[it.name]))
  regenerateOrder(items)
  return items
}
