import type { CommentArea } from './areas/base'
import { CommentAreaV1 } from './areas/v1'
import { CommentAreaV2 } from './areas/v2'

export const getCommentArea = (element: HTMLElement): CommentArea => {
  if (CommentAreaV2.isV2Area(element)) {
    return new CommentAreaV2(element)
  }
  return new CommentAreaV1(element)
}

export * from './areas/base'
export * from './areas/v1'
export * from './areas/v2'
