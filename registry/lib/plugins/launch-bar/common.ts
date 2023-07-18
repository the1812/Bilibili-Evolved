import type { LaunchBarAction } from '@/components/launch-bar/launch-bar-action'

export const matchInput = (input: string, pattern: RegExp) => {
  const match = input.match(pattern)
  if (!match) {
    return {}
  }
  const type = match[1]
  const id = match[2]
  const indexer = `${type}${id}`
  return {
    match,
    type,
    id,
    indexer,
  }
}

export const createLinkAction = (input: {
  name: string
  displayName?: string
  description?: string
  indexer: string
  link: string
}): LaunchBarAction => {
  const { name, displayName, description, indexer, link } = input
  return {
    name: name || indexer,
    displayName,
    icon: 'mdi-open-in-new',
    indexer,
    description,
    action: () => {
      window.open(link, '_blank')
    },
    order: 0,
  }
}
