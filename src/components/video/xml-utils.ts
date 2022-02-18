const normalizeMap = {
  '&#38;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&#34;': '"',
  '&#39;': "'",
}
const escapeMap = Object.fromEntries(Object.entries(normalizeMap).map(entry => entry.reverse()))
const replace = (content: string, map: Record<string, string>) => {
  for (const [key, value] of Object.entries(map)) {
    content = content.replace(new RegExp(key, 'g'), value)
  }
  return content
}

export const escapeContent = (content: string) => replace(content, escapeMap)
export const normalizeContent = (content: string) => replace(content, normalizeMap)
