import { getDevClientOptions } from './options'

const options = getDevClientOptions()

export const urlConverter = {
  toDevUrl: (originalUrl: string, kind = 'component') => {
    if (!originalUrl) {
      return null
    }
    const devUrlMatch = originalUrl.match(
      new RegExp(`localhost:${options.port}\\/registry\\/dist\\/${kind}s\\/(.+)$`),
    )
    if (devUrlMatch) {
      return originalUrl
    }
    const localhostMatch = originalUrl.match(new RegExp(`localhost:(\\d+?)\\/${kind}s\\/(.+)$`))
    if (localhostMatch) {
      return `http://localhost:${options.port}/registry/dist/${kind}s/${localhostMatch[2]}`
    }
    const onlineMatch = originalUrl.match(new RegExp(`\\/registry\\/dist\\/${kind}s\\/(.+)$`))
    if (onlineMatch) {
      return `http://localhost:${options.port}/registry/dist/${kind}s/${onlineMatch[1]}`
    }
    return null
  },
}
