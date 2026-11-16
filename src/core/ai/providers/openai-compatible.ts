import { monkey } from '@/core/ajax'
import { OpenAICompatibleConfig } from '../types'
import { AIProvider } from './base'

interface ChatCompletionResponse {
  choices?: {
    message: { content: string }
    finish_reason: string
  }[]
  error?: { message: string }
}

export class OpenAICompatibleProvider extends AIProvider {
  readonly id: string
  readonly displayName: string

  constructor(protected readonly config: OpenAICompatibleConfig) {
    super()
    this.id = config.id
    this.displayName = config.displayName
  }

  async generate(prompt: string) {
    const {
      baseUrl,
      model,
      apiKey,
      headers,
      temperature = 0,
      maxTokens = 4096,
      timeout = 120000,
      extraBody,
    } = this.config
    let response: ChatCompletionResponse
    try {
      response = await monkey<ChatCompletionResponse>({
        url: `${baseUrl.replace(/\/$/, '')}/chat/completions`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
          ...headers,
        },
        anonymous: true,
        responseType: 'json',
        timeout,
        data: JSON.stringify({
          temperature,
          max_tokens: maxTokens,
          ...lodash.omit(this.config, [
            'id',
            'displayName',
            'baseUrl',
            'apiKey',
            'headers',
            'temperature',
            'maxTokens',
            'timeout',
            'extraBody',
          ]),
          ...extraBody,
          model,
          messages: [{ role: 'user', content: prompt }],
          stream: false,
        }),
      })
    } catch (error) {
      const failure = error as MonkeyXhrResponse
      const message = (failure.response as ChatCompletionResponse)?.error?.message
      throw new Error(
        `${this.displayName}: ${message || failure.statusText || '请求失败'} (${failure.status})`,
        { cause: error },
      )
    }
    if (response?.error) {
      throw new Error(`${this.displayName}: ${response.error.message}`)
    }
    const choice = response?.choices?.[0]
    if (choice?.finish_reason === 'length') {
      throw new Error(`${this.displayName}: 输出超出长度限制，请缩短输入后重试`)
    }
    const result = choice?.message.content?.trim()
    if (!result) {
      throw new Error(`${this.displayName}: 未返回文本`)
    }
    return result
  }
}
