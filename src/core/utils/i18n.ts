import { registerAndGetData } from '@/plugins/data'

export const defaultLanguageCode = 'zh-CN'
export const browserLanguageCode = navigator.language
export const languageCodeToName: Record<string, string> = {
  'zh-CN': '简体中文',
  // 'ja-JP': '日本語',
  // 'en-US': 'English',
  // 'de-DE': 'Deutsch',
}
registerAndGetData('i18n', languageCodeToName)

export const languageNameToCode = (searchName: string) => {
  const entry = Object.entries(languageCodeToName).find(([, name]) => name === searchName)
  if (!entry) {
    return defaultLanguageCode
  }
  return entry[0]
}
