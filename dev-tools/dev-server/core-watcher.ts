import * as webpack from 'webpack'
import * as webpackConfig from '../../webpack/webpack.dev'
import { sendMessage } from './server'

export const startCoreWatcher = () => {
  const compiler = webpack(webpackConfig as webpack.Configuration)
  let lastHash = ''
  console.log('Starting core watcher')
  const instance = compiler.watch({}, (error, result) => {
    if (error) {
      console.error(error)
      process.exit(1)
    }
    if (result.hash === lastHash) {
      return
    }
    if (!lastHash) {
      console.log('Core watcher started')
    }
    lastHash = result.hash
    sendMessage({
      type: 'coreUpdate',
    })
  })
  process.on('beforeExit', () => instance.close(() => {
    console.log('Core watcher stopped')
  }))
}
