import { AIProvider } from '@/core/ai/providers/base'
import { AITranslateOptions } from '../types'
import { TranslateProvider } from './base'

const languageNames = new Intl.DisplayNames(['zh-CN'], { type: 'language' })

export class AITranslateProvider extends TranslateProvider {
  constructor(readonly provider: AIProvider) {
    super()
  }

  get name() {
    return this.provider.displayName
  }

  async translate(text: string, options: AITranslateOptions = {}) {
    const prompt = this.buildPrompt(text, options)
    const result = (await this.provider.generate(prompt)).trim()
    if (!result) {
      throw new Error(`${this.name}: 未返回译文`)
    }
    return result
  }

  protected buildPrompt(text: string, options: AITranslateOptions) {
    const { sourceLanguage = 'auto', targetLanguage = this.defaultLanguage, instruction } = options
    const source = sourceLanguage === 'auto' ? '' : languageNames.of(sourceLanguage)
    const target = languageNames.of(targetLanguage)
    if (instruction) {
      const constraints = instruction
        .trim()
        .split('\n')
        .map((line, index) => {
          const constraint = /^【(硬性要求|软性要求|注意)】/.test(line) ? line : `【注意】${line}`
          return `${index + 1}. ${constraint}`
        })
        .join('\n')
      return `请将以下${source}文本翻译成${target}，并且严格遵循所有约束要求。\n\n【源文】\n${text.trim()}\n\n【约束要求】\n${constraints}\n\n只输出译文，不要有任何额外说明。`
    }
    return `请将以下${source}文本翻译为${target}，直接输出翻译结果，不要进行任何解释。\n\n${text.trim()}`
  }
}
