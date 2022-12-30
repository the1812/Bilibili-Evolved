import { getDevClientOptions } from './options'

const options = getDevClientOptions()

export const urlConverter = {
  toDevUrl: (originalUrl: string) => {
    if (!originalUrl) {
      return null
    }
    const devUrlMatch = originalUrl.match(
      new RegExp(`localhost:${options.port}\\/registry\\/components\\/(.+)$`),
    )
    if (devUrlMatch) {
      return originalUrl
    }
    const localhostMatch = originalUrl.match(/localhost:(\d+?)\/components\/(.+)$/)
    if (localhostMatch) {
      return `http://localhost:${options.port}/registry/dist/components/${localhostMatch[2]}`
    }
    const onlineMatch = originalUrl.match(/\/registry\/dist\/components\/(.+)$/)
    if (onlineMatch) {
      return `http://localhost:${options.port}/registry/dist/components/${onlineMatch[1]}`
    }
    return null
  },
}
