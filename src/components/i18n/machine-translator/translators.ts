import { monkey } from '@/core/ajax'
import { UserAgent } from '@/core/utils/constants'
import { getComponentSettings } from '@/core/settings'
import { languageNameToCode } from '@/core/utils/i18n'
import { BuiltInTranslators } from './built-in-translators'

/* eslint-disable */
// export interface TranslateConfig {
//   targetLanguage?: string
// }
export abstract class MachineTranslateProvider {
  abstract translate(text: string): Promise<string>
  abstract name: string
  abstract link: string
  abstract defaultLanguage: string
  protected getTargetLanguage() {
    const i18n = getComponentSettings('i18n')
    if (i18n.enabled) {
      return languageNameToCode(i18n.options.language)
    }
    return this.defaultLanguage
  }
}
export class BingTranslate extends MachineTranslateProvider {
  name = 'Bing'
  link = 'https://translate.bing.com/'
  defaultLanguage = 'zh-Hans'
  async translate(text: string) {
    let targetLanguage = this.getTargetLanguage()
    if (targetLanguage === 'zh-CN') {
      targetLanguage = this.defaultLanguage
    } else if (targetLanguage.includes('-') && targetLanguage !== this.defaultLanguage) {
      targetLanguage = targetLanguage.substring(0, targetLanguage.indexOf('-'))
    }
    console.log(targetLanguage)
    try {
      const response = await monkey({
        url: 'https://cn.bing.com/ttranslatev3',
        method: 'POST',
        data: Object.entries({
          fromLang: 'auto-detect',
          to: targetLanguage,
          text,
        }).map(([key, value]) => `${key}=${value}`).join('&'),
        headers: {
          'User-Agent': UserAgent,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        responseType: 'json',
      })
      const [result] = response
      if (result.translations) {
        return (result.translations as any[]).map(t => t.text as string).join('\n')
      }
      console.error('Translator: Bing', result)
      throw new Error('调用Bing翻译失败.')
    } catch (error) {
      console.error('Translator: Bing', error)
      throw new Error('调用Bing翻译失败.')
    }
  }
}
export class GoogleTranslate extends MachineTranslateProvider {
  name = 'Google'
  link = 'https://translate.google.com/'
  defaultLanguage = 'zh'
  protected apiUrl = 'https://translate.google.com/translate_a/single'

  async translate(text: string) {
    let targetLanguage = this.getTargetLanguage()
    if (targetLanguage.includes('-') && targetLanguage !== this.defaultLanguage) {
      targetLanguage = targetLanguage.substring(0, targetLanguage.indexOf('-'))
    }
    try {
      const response = await monkey({
        url: `${this.apiUrl}?${Object.entries({
          client: 'gtx',
          sl: 'auto',
          tl: targetLanguage,
          dt: 't',
          q: encodeURIComponent(text),
        }).map(([key, value]) => `${key}=${value}`).join('&')}`,
        method: 'GET',
        headers: {
          'User-Agent': UserAgent,
        },
        responseType: 'json',
      })
      const result = response[0].map((it: any) => it[0]).join('')
      return result
    } catch (error) {
      console.error('Translator: Google', error)
      throw new Error('调用Google翻译失败.')
    }
  }
}
export class GoogleCNTranslate extends GoogleTranslate {
  link = 'https://translate.google.cn/'
  protected apiUrl = 'https://translate.google.cn/translate_a/single'
}

export const MachineTranslateProviderPlugin = 'MachineTranslateProvider'
const extraProviders = new Map<string, (new () => MachineTranslateProvider)>()
export const getTranslator = (): MachineTranslateProvider => {
  const { options: { translator } } = getComponentSettings('machineTranslator')
  if (extraProviders.has(translator)) {
    return new (extraProviders.get(translator))()
  }
  switch (translator) {
    default: // fallthrough
    case BuiltInTranslators.Bing: return new BingTranslate()
    case BuiltInTranslators.Google: return new GoogleTranslate()
    case BuiltInTranslators.GoogleCN: return new GoogleCNTranslate()
  }
}
