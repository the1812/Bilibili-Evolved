import { defaultLanguageCode, languageCodeToName } from '@/core/utils/i18n'
import { defineComponentMetadata } from '@/components/define'
import { componentsTags } from '../types'
import { translateProviderNames, translateProviders } from './machine-translator/translators'
import { startTranslate } from './dom-translator'

export const component = defineComponentMetadata({
  name: 'i18n',
  displayName: '多语言',
  configurable: false,
  entry: startTranslate,
  tags: [componentsTags.utils, componentsTags.experimental, componentsTags.general],
  description: {
    'zh-CN':
      '安装其他语言包可以更换界面语言, 机器翻译选择可以设定其他一些功能如`动态翻译`, `评论翻译`使用的翻译器. 机器翻译的选择不影响界面语言.',
  },
  options: {
    language: {
      defaultValue: languageCodeToName[defaultLanguageCode],
      displayName: '界面语言选择',
      dropdownEnum: languageCodeToName,
    },
    translator: {
      defaultValue: Object.keys(translateProviders)[0],
      displayName: '机器翻译选择',
      dropdownEnum: translateProviderNames,
    },
  },
  // 相关功能好像全挂了, 先隐藏了
  hidden: true,
})
