import { AIProvider } from '@/core/ai'
import { AITranslateProvider } from '@/core/translate'

const protectTranslationText = (text: string) => {
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

export const translateText = async (text: string, provider: AIProvider, targetLanguage: string) => {
  const translator = new AITranslateProvider(provider)
  const protectedText = protectTranslationText(text)
  const translatedText = await translator.translate(protectedText.text, {
    targetLanguage,
    instruction: '【硬性要求】原样保留所有 {{TRANSLATE_PLACEHOLDER_*}} 占位符，保留原有换行。',
  })
  return protectedText.restore(translatedText)
}
