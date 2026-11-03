export const parseAIProviderParameters = (text: string) => {
  const parameters: Record<string, unknown> = {}
  text.split('\n').forEach((line, index) => {
    if (!line.trim()) {
      return
    }
    const separator = line.indexOf('=')
    const key = line.slice(0, separator).trim()
    if (separator === -1 || !key) {
      throw new Error(`第 ${index + 1} 行参数无效，请使用 key=value 格式`)
    }
    const rawValue = line.slice(separator + 1).trim()
    let value: unknown = rawValue
    try {
      value = JSON.parse(rawValue)
    } catch {
      value = rawValue
    }
    lodash.set(parameters, key, value)
  })
  return parameters
}

export const splitAIProviderParameters = (text: string) => {
  const stored: string[] = []
  const session: string[] = []
  text.split('\n').forEach(line => {
    const key = line.slice(0, line.indexOf('=')).trim()
    const target = key === 'apiKey' || key.startsWith('headers.') ? session : stored
    target.push(line)
  })
  return { stored: stored.join('\n'), session: session.join('\n') }
}
