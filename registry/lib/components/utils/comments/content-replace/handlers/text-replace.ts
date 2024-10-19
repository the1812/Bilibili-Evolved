import { getComponentSettings } from '@/core/settings'
import { createEmotionImage } from '../utils'
import { CommentContentReplaceHandler } from './types'
import { CommentContentReplaceOptions } from '../options'

const { options } = getComponentSettings<CommentContentReplaceOptions>('commentContentReplace')

const isUrl = (text: string) => {
  try {
    const url = new URL(text)
    return Boolean(url)
  } catch (error) {
    return false
  }
}

abstract class NodeContentReplacer {
  abstract isKeywordMatch(node: Node, keyword: string, target: string): boolean
  abstract replaceContent(node: Node, keyword: string, target: string): Node[]
}

class TextToTextReplacer extends NodeContentReplacer {
  isKeywordMatch(node: Node, keyword: string) {
    if (node instanceof Text) {
      return node.textContent.includes(keyword)
    }
    return false
  }
  replaceContent(node: Node, keyword: string, target: string): Node[] {
    const index = node.textContent.indexOf(keyword)
    if (index === -1) {
      return []
    }
    const leftPart = node.textContent.substring(0, index)
    const rightPart = node.textContent.substring(index + keyword.length)
    node.textContent = `${leftPart}${target}${rightPart}`
    return []
  }
}

class TextToEmotionReplacer extends NodeContentReplacer {
  isKeywordMatch(node: Node, keyword: string, target: string) {
    if (node instanceof Text) {
      return node.textContent.includes(keyword) && isUrl(target)
    }
    return false
  }
  replaceContent(node: Node, keyword: string, target: string): Node[] {
    const index = node.textContent.indexOf(keyword)
    if (index === -1 || !(node instanceof Text)) {
      return []
    }
    const leftPart = new Text(node.textContent.substring(0, index))
    const imageElement = createEmotionImage(target, keyword)
    const rightPart = new Text(node.textContent.substring(index + keyword.length))
    node.replaceWith(leftPart, imageElement, rightPart)
    return [rightPart]
  }
}

class EmotionToTextReplacer extends NodeContentReplacer {
  isKeywordMatch(node: Node, keyword: string) {
    if (node instanceof HTMLImageElement) {
      return node.alt === keyword
    }
    return false
  }
  replaceContent(node: Node, keyword: string, target: string): Node[] {
    if (!(node instanceof HTMLImageElement)) {
      return []
    }
    node.replaceWith(new Text(target))
    return []
  }
}

class EmotionToEmotionReplacer extends NodeContentReplacer {
  isKeywordMatch(node: Node, keyword: string, target: string) {
    if (node instanceof HTMLImageElement) {
      return node.alt === keyword && isUrl(target)
    }
    return false
  }
  replaceContent(node: Node, keyword: string, target: string): Node[] {
    if (!(node instanceof HTMLImageElement)) {
      return []
    }
    node.src = target
    return []
  }
}

class RecursiveReplacer extends NodeContentReplacer {
  isKeywordMatch() {
    return true
  }
  replaceContent(node: Node): Node[] {
    return Array.from(node.childNodes)
  }
}

const contentReplacers: NodeContentReplacer[] = [
  new TextToEmotionReplacer(),
  new EmotionToEmotionReplacer(),
  new TextToTextReplacer(),
  new EmotionToTextReplacer(),
  new RecursiveReplacer(),
]

export const textReplace: CommentContentReplaceHandler = content => {
  const { replaceMap } = options
  content.forEach(node => {
    Object.entries(replaceMap).forEach(([from, to]) => {
      const replacer = contentReplacers.find(r => r.isKeywordMatch(node, from, to))
      if (!replacer) {
        return
      }
      const restParts = replacer.replaceContent(node, from, to)
      textReplace(restParts)
    })
  })
}
