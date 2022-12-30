import { monkey } from '@/core/ajax'
import { UserAgent } from '@/core/utils/constants'
import { getComponentSettings } from '@/core/settings'
import { languageNameToCode } from '@/core/utils/i18n'
import { registerAndGetData } from '@/plugins/data'
import { formData } from '@/core/utils'
import { Options as I18nOptions } from '../types'

export abstract class MachineTranslateProvider {
  abstract translate(text: string): Promise<string>
  abstract name: string
  abstract link: string
  abstract defaultLanguage: string
  protected getTargetLanguage() {
    const i18n = getComponentSettings<I18nOptions>('i18n')
    if (i18n.enabled) {
      return languageNameToCode(i18n.options.language)
    }
    return this.defaultLanguage
  }
  toString() {
    return this.name
  }
}
/** @deprecated API needs auth now */
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
        data: formData({
          fromLang: 'auto-detect',
          to: targetLanguage,
          text,
        }),
        headers: {
          'User-Agent': UserAgent,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        responseType: 'json',
      })
      console.log(response)
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
        url: `${this.apiUrl}?${formData({
          client: 'gtx',
          sl: 'auto',
          tl: targetLanguage,
          dt: 't',
          q: encodeURIComponent(text),
        })}`,
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
  name = 'GoogleCN'
  link = 'https://translate.google.cn/'
  protected apiUrl = 'https://translate.google.cn/translate_a/single'
}

export const [translateProviders] = registerAndGetData('i18n.machineTranslators', {
  // Bing: new BingTranslate(),
  GoogleCN: new GoogleCNTranslate(),
  Google: new GoogleTranslate(),
} as Record<string, MachineTranslateProvider>)
export const translateProviderNames = Object.keys(translateProviders)
export const getTranslator = (): MachineTranslateProvider => {
  const {
    options: { translator },
  } = getComponentSettings<I18nOptions>('i18n')
  const provider = translateProviders[translator] || translateProviders.GoogleCN
  return provider
}
