import { addData } from '@/plugins/data'
import { getComponentSettings } from '@/core/settings'
import { languageNameToCode } from '@/core/utils/i18n'
import { Translation, GeneralTranslation, RegexTranslation } from './types'

/**
 * 在`plugin.setup`中可使用此帮助函数快速注入翻译数据
 * @param languageCode 语言代码
 * @param mapData 普通翻译数据
 * @param regexData 正则翻译数据
 */
export const addI18nData = (
  languageCode: string,
  mapData?: [string, Translation][],
  regexData?: RegexTranslation,
) => {
  addData(`i18n.${languageCode}`, (map: GeneralTranslation, regex: RegexTranslation) => {
    mapData?.forEach(([k, v]) => map.set(k, v))
    if (regexData) {
      regex.push(...regexData)
    }
  })
}
export const getSelectedLanguage = () => {
  const settings = getComponentSettings('i18n')
  return languageNameToCode(settings.options.language)
}
