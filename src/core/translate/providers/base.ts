import { TranslateOptions } from '../types'

export abstract class TranslateProvider {
  abstract readonly name: string
  readonly defaultLanguage: string = 'zh-CN'

  abstract translate(text: string, options?: TranslateOptions): Promise<string>

  toString() {
    return this.name
  }
}
