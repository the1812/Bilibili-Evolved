import { getRandomId } from '@/core/utils'

export class CommentContentReplaceRow {
  key = getRandomId()
  constructor(public from = '', public to = '') {}
}
