import { defineComponentMetadata } from '@/components/define'
import { componentsTags } from '@/components/types'
import { getAIProviders } from '@/core/ai'
import { options } from './options'

export const component = defineComponentMetadata({
  name: 'ai-provider',
  displayName: 'AI 模型配置',
  tags: [componentsTags.general],
  configurable: false,
  options,
  entry: () => {
    getAIProviders()
  },
  extraOptions: () => import('./ExtraOptions.vue').then(m => m.default),
})
