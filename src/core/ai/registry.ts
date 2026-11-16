import { reactive } from 'vue'
import { addComponentListener, getComponentSettings } from '@/core/settings'
import { getData, registerData } from '@/plugins/data'
import type { AIProviderOptions } from '@/components/ai-provider/options'
import { parseAIProviderParameters, splitAIProviderParameters } from './parameters'
import { builtInAIProviderConfigs, defaultAIProviderId } from './presets'
import { AIProvider } from './providers/base'
import { OpenAICompatibleProvider } from './providers/openai-compatible'
import { AIProviderConfig } from './types'

export const aiProvidersKey = 'aiProvider.providers'
const state = reactive({
  configuredProviders: [] as AIProvider[],
  pluginProviders: [] as AIProvider[],
})
const sessionParameters = new Map<string, string>()
registerData(aiProvidersKey, state.pluginProviders)
let initialized = false

export const getAIProviderParameters = (config: AIProviderConfig) =>
  [config.parameters, sessionParameters.get(config.id)].filter(Boolean).join('\n')

const updateProviders = () => {
  const { providers } = getComponentSettings<AIProviderOptions>('ai-provider').options
  state.configuredProviders = [...builtInAIProviderConfigs, ...providers].map(
    config =>
      new OpenAICompatibleProvider({
        ...parseAIProviderParameters(getAIProviderParameters(config)),
        id: config.id,
        displayName: config.displayName,
        baseUrl: config.baseUrl,
        model: config.model || undefined,
      }),
  )
}

export const getAIProviders = (): AIProvider[] => {
  if (!initialized) {
    const { options } = getComponentSettings<AIProviderOptions>('ai-provider')
    if (options.providers.some(config => config.model === undefined)) {
      options.providers = options.providers.map(config => {
        if (config.model !== undefined) {
          return config
        }
        const { model } = parseAIProviderParameters(config.parameters)
        return {
          ...config,
          model: String(model ?? ''),
          parameters: config.parameters.replace(/^\s*model\s*=.*(?:\r?\n|$)/gm, ''),
        }
      })
    }
    updateProviders()
    addComponentListener('ai-provider.providers', updateProviders)
    initialized = true
  }
  getData(aiProvidersKey)
  return [...state.configuredProviders, ...state.pluginProviders]
}

export const getAIProvider = (id = defaultAIProviderId) => {
  const provider = getAIProviders().find(item => item.id === id)
  if (!provider) {
    throw new Error(`找不到 AI 模型配置：${id}`)
  }
  return provider
}

export const setAIProviderConfig = (config: AIProviderConfig) => {
  const value = {
    ...config,
    displayName: config.displayName.trim(),
    baseUrl: config.baseUrl.trim(),
    model: config.model.trim(),
  }
  if (!value.id.trim()) {
    throw new Error('模型配置缺少 ID')
  }
  if (!value.displayName) {
    throw new Error('请填写显示名称')
  }
  if (!value.model) {
    throw new Error('请填写模型名称')
  }
  if (!URL.canParse(value.baseUrl)) {
    throw new Error('请输入有效的 URL')
  }
  parseAIProviderParameters(value.parameters)
  getAIProviders()
  if ([...builtInAIProviderConfigs, ...state.pluginProviders].some(item => item.id === value.id)) {
    throw new Error('ID 不可重复')
  }
  const { stored, session } = splitAIProviderParameters(value.parameters)
  const { options } = getComponentSettings<AIProviderOptions>('ai-provider')
  sessionParameters.set(value.id, session)
  const providers = [...options.providers]
  const index = providers.findIndex(item => item.id === value.id)
  const savedConfig = { ...value, parameters: stored }
  if (index === -1) {
    providers.push(savedConfig)
  } else {
    providers[index] = savedConfig
  }
  options.providers = providers
}

export const deleteAIProviderConfig = (id: string) => {
  const { options } = getComponentSettings<AIProviderOptions>('ai-provider')
  sessionParameters.delete(id)
  options.providers = options.providers.filter(item => item.id !== id)
}
