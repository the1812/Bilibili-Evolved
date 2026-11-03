export interface TranslateOptions {
  sourceLanguage?: string
  targetLanguage?: string
}

export interface AITranslateOptions extends TranslateOptions {
  instruction?: string
}
