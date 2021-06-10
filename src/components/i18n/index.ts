import { defaultLanguageCode, languageCodeToName } from '@/core/utils/i18n'
import { ComponentMetadata, componentsTags } from '../types'
import { startTranslate } from './translator'

export const component: ComponentMetadata = {
  name: 'i18n',
  displayName: '多语言',
  enabledByDefault: true,
  configurable: false,
  entry: startTranslate,
  tags: [
    componentsTags.utils,
    componentsTags.experimental,
    componentsTags.general,
  ],
  description: {
    'zh-CN': '为界面上的常见文本提供翻译.',
    'en-US': 'Change UI language.',
  },
  options: {
    language: {
      defaultValue: languageCodeToName[defaultLanguageCode],
      displayName: '语言选择',
      dropdownEnum: languageCodeToName,
    },
  },
}
