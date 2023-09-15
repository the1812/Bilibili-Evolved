import { FeedsCardType, feedsCardTypes } from '@/components/feeds/api'

const testPattern = (pattern: string, text: string) => {
  if (!pattern || !text) {
    return false
  }
  if (pattern.startsWith('/') && pattern.endsWith('/')) {
    return new RegExp(pattern.slice(1, pattern.length - 1)).test(text)
  }
  return text.includes(pattern)
}
export interface BlockableCard {
  text: string
  username: string
  type: FeedsCardType
  element: HTMLElement
}
export const hasBlockedPattern = (pattern: string, card: BlockableCard) => {
  const upNameMatch = pattern.match(/(.+) up:([^ ]+)/)
  if (upNameMatch) {
    return testPattern(upNameMatch[1], card.text) && testPattern(upNameMatch[2], card.username)
  }
  // FIXME: 图文动态的 text 为空，应该是 card 相关的 API 有 bug。这里只做简单的判断
  if (card.type === feedsCardTypes.textWithImages) {
    card.text = card.element.innerText
  }
  return testPattern(pattern, card.text)
}
