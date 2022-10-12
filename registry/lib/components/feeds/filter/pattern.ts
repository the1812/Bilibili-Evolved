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
  // [key: string]: string
}
export const hasBlockedPattern = (pattern: string, card: BlockableCard) => {
  const upNameMatch = pattern.match(/(.+) up:([^ ]+)/)
  if (upNameMatch) {
    return testPattern(upNameMatch[1], card.text) && testPattern(upNameMatch[2], card.username)
  }
  return testPattern(pattern, card.text)
}
