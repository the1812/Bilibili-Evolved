export interface AIProviderConfig {
  readonly id: string
  displayName: string
  baseUrl: string
  model: string
  parameters: string
}

export interface OpenAICompatibleConfig extends Record<string, unknown> {
  readonly id: string
  displayName: string
  baseUrl: string
  model?: string
  apiKey?: string
  headers?: Record<string, string>
  temperature?: number
  maxTokens?: number
  timeout?: number
  extraBody?: Record<string, unknown>
}
