import { generalGroupId, generalGroupName, KeywordGroup, normalizeText } from './rules'

export type GroupStatus = 'all' | 'enabled' | 'disabled'
export const groupPageSize = 20

export const uniqueKeywords = (words: string[]): string[] => {
  const seen = new Set<string>()
  return words
    .map(word => word.trim())
    .filter(word => {
      const normalized = normalizeText(word)
      if (!normalized || seen.has(normalized)) {
        return false
      }
      seen.add(normalized)
      return true
    })
}

export const prepareKeywordGroups = (groups: KeywordGroup[]): KeywordGroup[] => {
  if (groups.some(group => group.id === generalGroupId)) {
    return groups
  }
  const singles = new Set(
    groups.filter(
      group =>
        group.enabled &&
        !group.name?.trim() &&
        group.keywords.filter(word => word.trim()).length === 1,
    ),
  )
  return [
    {
      id: generalGroupId,
      name: generalGroupName,
      enabled: true,
      keywords: uniqueKeywords([...singles].flatMap(group => group.keywords)),
    },
    ...groups.filter(group => !singles.has(group)),
  ]
}

export const findKeywordGroups = (groups: KeywordGroup[], query: string, status: GroupStatus) => {
  const search = normalizeText(query)
  return groups
    .map((group, index) => ({ group, index }))
    .filter(({ group, index }) => {
      if (status !== 'all' && group.enabled !== (status === 'enabled')) {
        return false
      }
      return (
        !search ||
        normalizeText(`${group.name || ''} ${group.keywords.join(' ')} ${index + 1}`).includes(
          search,
        )
      )
    })
}

export const parseKeywordGroups = (text: string): string[][] =>
  text
    .split(/\r\n|\r|\n/)
    .map(line =>
      line
        .split('|')
        .map(word => word.trim())
        .filter(Boolean),
    )
    .filter(words => words.length > 0)
