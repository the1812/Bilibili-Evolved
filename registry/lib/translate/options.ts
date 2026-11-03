import { defineOptionsMetadata, OptionsOfMetadata } from '@/components/define'
import { defaultAIProviderId } from '@/core/ai'

const targetLanguages = {
  简体中文: 'zh-CN',
  繁體中文: 'zh-TW',
  英语: 'en',
  日语: 'ja',
  韩语: 'ko',
  泰语: 'th',
  越南语: 'vi',
  印度尼西亚语: 'id',
  阿拉伯语: 'ar',
  葡萄牙语: 'pt',
  西班牙语: 'es',
  土耳其语: 'tr',
  俄语: 'ru',
  马来语: 'ms',
}

export const getTargetLanguage = (selection: TranslateOptions['targetLanguage']) => {
  if (selection !== '自动') {
    return targetLanguages[selection]
  }
  const [, locale] = location.pathname.split('/')
  if (locale === 'zh-Hant') {
    return targetLanguages.繁體中文
  }
  return (
    Object.values(targetLanguages).find(language => language === locale) ?? targetLanguages.简体中文
  )
}

export const options = defineOptionsMetadata({
  entryPoint: {
    displayName: '翻译入口',
    defaultValue: '菜单项' as '常驻按钮' | '菜单项',
    dropdownEnum: ['常驻按钮', '菜单项'],
  },
  providerId: {
    defaultValue: defaultAIProviderId,
    hidden: true,
  },
  targetLanguage: {
    displayName: '目标语言',
    defaultValue: '自动' as '自动' | keyof typeof targetLanguages,
    dropdownEnum: ['自动', ...Object.keys(targetLanguages)],
  },
})

export type TranslateOptions = OptionsOfMetadata<typeof options>
