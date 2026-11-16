import type { RegistryFilterSelection, RegistryItemData } from './types'

const nameCollator = new Intl.Collator('en', { sensitivity: 'base', numeric: true })

export const queryRegistryItems = (
  items: RegistryItemData[],
  { sort, status, type, tag }: RegistryFilterSelection,
  keyword: string,
  isInstalled: (item: RegistryItemData) => boolean,
) => {
  const matches = items.filter(
    item =>
      (!status || isInstalled(item) === (status === 'installed')) &&
      (!type || item.type === type) &&
      (!tag || item.componentTags.some(itemTag => itemTag.name === tag)) &&
      (!keyword || item.searchText.includes(keyword)),
  )
  switch (sort) {
    case 'nameAsc':
      return matches.sort((a, b) => nameCollator.compare(a.nameSortKey, b.nameSortKey))
    case 'nameDesc':
      return matches.sort((a, b) => nameCollator.compare(b.nameSortKey, a.nameSortKey))
    case 'installed':
      return matches.sort((a, b) => Number(isInstalled(b)) - Number(isInstalled(a)))
    case 'notInstalled':
      return matches.sort((a, b) => Number(isInstalled(a)) - Number(isInstalled(b)))
    default:
      return matches
  }
}
