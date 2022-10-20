import webpack from 'webpack'
import exitHook from 'async-exit-hook'
import webpackConfig from '../../webpack/webpack.dev'
import { sendMessage } from './web-socket-server'
import { defaultWatcherHandler } from './watcher-common'

export const startCoreWatcher = () =>
  new Promise<void>(resolve => {
    const compiler = webpack(webpackConfig as webpack.Configuration)
    console.log('本体编译中...')
    const instance = compiler.watch(
      {},
      defaultWatcherHandler(
        () => resolve(),
        result => {
          console.log('本体已编译:', result.hash)
          sendMessage({
            type: 'coreUpdate',
          })
        },
      ),
    )
    exitHook(exit =>
      instance.close(() => {
        console.log('本体编译器已退出')
        exit()
      }),
    )
  })
