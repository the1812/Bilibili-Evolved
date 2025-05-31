import type { CommentArea } from './areas/base'
import { CommentAreaV1 } from './areas/v1'
import { CommentAreaV2 } from './areas/v2'
import { CommentAreaV3 } from './areas/v3'

export const getCommentArea = (element: HTMLElement): CommentArea => {
  if (CommentAreaV3.isV3Area(element)) {
    return new CommentAreaV3(element)
  }
  if (CommentAreaV2.isV2Area(element)) {
    return new CommentAreaV2(element)
  }
  return new CommentAreaV1(element)
}

export * from './areas/base'
export * from './areas/v1'
export * from './areas/v2'
export * from './areas/v3'
