interface TranslateConfig {
  targetLanguage?: string
}
abstract class FeedsTranslateProvider {
  abstract translate(text: string, config?: TranslateConfig): Promise<string>
  abstract name: string
  abstract link: string
}
class BingTranslate extends FeedsTranslateProvider {
  name = 'Bing'
  link = 'https://translate.bing.com/'
  async translate(text: string, config?: TranslateConfig) {
    const defaultLanguage = 'zh-Hans'
    let targetLanguage = _.get(config, 'targetLanguage', defaultLanguage)
    if (targetLanguage.includes('-') && targetLanguage !== defaultLanguage) {
      targetLanguage = targetLanguage.substring(0, targetLanguage.indexOf('-'))
    }
    const response = await Ajax.monkey({
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
    } else {
      throw new Error('调用Bing翻译失败.\n' + JSON.stringify(result))
    }
  }
}
class GoogleTranslate extends FeedsTranslateProvider {
  name = 'Google'
  link = 'https://translate.google.com/'
  protected apiUrl = 'https://translate.google.com/translate_a/single'

  async translate(text: string, config?: TranslateConfig) {
    const defaultLanguage = 'zh'
    let targetLanguage = _.get(config, 'targetLanguage', defaultLanguage)
    if (targetLanguage.includes('-') && targetLanguage !== defaultLanguage) {
      targetLanguage = targetLanguage.substring(0, targetLanguage.indexOf('-'))
    }
    const response = await Ajax.monkey({
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
    console.log(_.flattenDeep(response), response, response[0].map((it: any) => it[0]).join('\n'))
    const result = response[0].map((it: any) => it[0]).join('')
    return result
  }
}
class GoogleCNTranslate extends GoogleTranslate {
  link = 'https://translate.google.cn/'
  protected apiUrl = 'https://translate.google.cn/translate_a/single'
}
export const getTranslator = (): FeedsTranslateProvider => {
  switch (settings.feedsTranslateProvider) {
    default: // fallthrough
    case 'Bing': return new BingTranslate()
    case 'Google': return new GoogleTranslate()
    case 'GoogleCN': return new GoogleCNTranslate()
  }
}
export default {
  export: {
    getTranslator,
  },
}