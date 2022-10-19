import { readFileSync, existsSync } from 'fs'

interface DevServerConfig {
  port?: number
  maxWatchers?: number
}
const configFile = (path: string) => () =>
  existsSync(path) ? JSON.parse(readFileSync(path, { encoding: 'utf-8' })) : {}
const configSource: (() => DevServerConfig)[] = [
  () => ({
    port: 23333,
    maxWatchers: 16,
  }),
  configFile('dev/dev-server.json'),
]
export const devServerConfig = configSource.reduce(
  (previous, current) => ({ ...previous, ...current() }),
  {} as DevServerConfig,
)
