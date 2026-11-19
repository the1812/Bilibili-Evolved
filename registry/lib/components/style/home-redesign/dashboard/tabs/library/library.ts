export interface LibraryEntry {
  id: string | number
  title: string
  url?: string
  cover?: string
  author?: string
  detail?: string
  badge?: string
  progress?: number
}

export const filterLibraryEntries = (entries: LibraryEntry[], keyword: string) => {
  const query = keyword.trim().toLocaleLowerCase()
  return query
    ? entries.filter(({ title, author }) =>
        [title, author].some(value => value?.toLocaleLowerCase().includes(query)),
      )
    : entries
}
