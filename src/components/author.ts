import type { Author, FeatureBase } from './types'

export const getFeatureAuthors = (author: FeatureBase['author']): Author[] => {
  if (!author) {
    return []
  }
  return Array.isArray(author) ? author : [author]
}
