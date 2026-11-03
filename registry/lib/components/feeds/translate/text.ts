export const protectFeedsText = (text: string) => {
  const tokens: string[] = []
  const protectedText = text.replace(
    /https?:\/\/[^\s\u200b]+|@[^\s@#，。！？、：；,.!?:;]+|#[^#\r\n]+#|\[[^\]\r\n]+\]/g,
    token => {
      const placeholder = `{{TRANSLATE_PLACEHOLDER_${tokens.length}}}`
      tokens.push(token)
      return placeholder
    },
  )
  return {
    text: protectedText,
    restore(result: string) {
      tokens.forEach((token, index) => {
        const placeholder = `{{TRANSLATE_PLACEHOLDER_${index}}}`
        if (!result.includes(placeholder)) {
          throw new Error('译文未能完整保留话题、表情或链接，请重试')
        }
        result = result.replaceAll(placeholder, token)
      })
      return result
    },
  }
}
