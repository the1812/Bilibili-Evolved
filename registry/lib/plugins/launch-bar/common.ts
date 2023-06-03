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
  description?: string
  indexer: string
  link: string
}) => {
  const { name, description, indexer, link } = input
  return {
    name: name || indexer,
    icon: 'mdi-open-in-new',
    indexer,
    description,
    action: () => {
      window.open(link, '_blank')
    },
    order: 0,
  }
}
