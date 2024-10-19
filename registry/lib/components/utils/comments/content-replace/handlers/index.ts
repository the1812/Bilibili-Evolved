import { registerData } from '@/plugins/data'
import { textReplace } from './text-replace'

export const CommentContentReplaceHandlers = 'commentContentReplace.handlers'
export const handlers = registerData(CommentContentReplaceHandlers, [textReplace])
