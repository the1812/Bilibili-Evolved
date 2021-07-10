import { ComponentMetadata, componentsTags } from '@/components/component'
import { none } from '@/core/utils'
import { BuiltInTranslators } from './built-in-translators'
import desc from './desc.md'

export const component: ComponentMetadata = {
  name: 'machineTranslator',
  displayName: '机器翻译选择',
  description: {
    'zh-CN': desc,
  },
  configurable: false,
  entry: none,
  options: {
    translator: {
      displayName: '翻译器',
      defaultValue: BuiltInTranslators.Bing,
      dropdownEnum: BuiltInTranslators,
    },
  },
  tags: [
    componentsTags.general,
  ],
}
