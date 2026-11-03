import { AIProviderConfig } from './types'

export const defaultAIProviderId = 'Index-Translate-9B'

export const builtInAIProviderConfigs: AIProviderConfig[] = [
  'Index-Translate-2B',
  defaultAIProviderId,
  'Index-Translate-35B-A3B',
].map(model => ({
  id: model,
  displayName: model,
  model,
  baseUrl: 'https://index-translate.bilibili.com/v1',
  parameters: [
    'headers.User-Agent=Index-Translate-Client/1.0',
    'extraBody.chat_template_kwargs.enable_thinking=false',
  ].join('\n'),
}))
