import webpack from 'webpack'
import exitHook from 'async-exit-hook'
import webpackConfig from '../../webpack/webpack.dev'
import { sendMessage } from './web-socket-server'
import { defaultWatcherHandler } from './watcher-common'

export const startCoreWatcher = () => {
  const compiler = webpack(webpackConfig as webpack.Configuration)
  console.log('Starting core watcher')
  const instance = compiler.watch({}, defaultWatcherHandler(
    () => console.log('Core watcher started'),
    result => {
      console.log('coreUpdate:', result.hash)
      sendMessage({
        type: 'coreUpdate',
      })
    },
  ))
  exitHook(exit => instance.close(() => {
    console.log('Core watcher stopped')
    exit()
  }))
}
