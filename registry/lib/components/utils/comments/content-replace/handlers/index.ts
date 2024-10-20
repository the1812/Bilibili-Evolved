import { registerAndGetData } from '@/plugins/data'
import { getComponentSettings } from '@/core/settings'
import { CommentContentReplaceHandler } from './types'
import { CommentContentReplaceOptions } from '../options'
import { NodeContentReplacer } from './node-content-replacer'
import { EmoticonToEmoticonReplacer } from './emoticon-to-emoticon'
import { EmoticonToTextReplacer } from './emoticon-to-text'
import { RecursiveReplacer } from './recursive'
import { TextToEmoticonReplacer } from './text-to-emoticon'
import { TextToTextReplacer } from './text-to-text'

const { options } = getComponentSettings<CommentContentReplaceOptions>('commentContentReplace')

const contentReplacers: NodeContentReplacer[] = [
  new TextToEmoticonReplacer(),
  new EmoticonToEmoticonReplacer(),
  new TextToTextReplacer(),
  new EmoticonToTextReplacer(),
  new RecursiveReplacer(),
]

export const CommentContentReplaceDefaultHandlerReplaceMap =
  'commentContentReplace.defaultHandler.replaceMap'
const defaultHandler: CommentContentReplaceHandler = ({ content }) => {
  const { replaceMap } = options
  const [finalReplaceMap] = registerAndGetData(
    CommentContentReplaceDefaultHandlerReplaceMap,
    replaceMap,
  )
  const replaceNodes = (nodes: Node[]) => {
    nodes.forEach(node => {
      Object.entries(finalReplaceMap).forEach(([from, to]) => {
        if (from === to || from === '') {
          return
        }
        const replacer = contentReplacers.find(r => r.isKeywordMatch(node, from, to))
        if (!replacer) {
          return
        }
        const restParts = replacer.replaceContent(node, from, to)
        replaceNodes(restParts)
      })
    })
  }
  replaceNodes(content)
}

export const CommentContentReplaceHandlers = 'commentContentReplace.handlers'
export const handlers = registerAndGetData(CommentContentReplaceHandlers, [defaultHandler])
